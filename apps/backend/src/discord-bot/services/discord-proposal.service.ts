import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { randomUUID } from 'crypto';
import { ChannelType, MessageReaction, User } from 'discord.js';
import {
	getSubmissionExplanation,
	getVoteExplanation,
	getResultExplanation,
} from '../utils/discord-proposal.utils';
import { DiscordClientService } from './discord-client.service';
import { DiscordProposalFormService } from './discord-proposal-form.service';
import { DiscordProposalVoteService } from './discord-proposal-vote.service';

@Injectable()
export class DiscordProposalService {
	private readonly logger = new Logger(DiscordProposalService.name);
	private pendingProposals = new Map<
		string,
		{ sujet: string; description: string; format?: string }
	>();

	constructor(
		@InjectRepository(DiscordServer)
		private discordServerRepository: Repository<DiscordServer>,
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		private readonly discordClientService: DiscordClientService,
		private readonly formService: DiscordProposalFormService,
		private readonly voteService: DiscordProposalVoteService,
	) {}

	async handleProposerIdee(interaction: any) {
		const modal = this.formService.createIdeaModal();
		await interaction.showModal(modal);
	}

	async handleModalSujet(interaction: any) {
		const sujet = interaction.fields.getTextInputValue('sujet');
		const description = interaction.fields.getTextInputValue('description');
		const id = randomUUID();
		this.pendingProposals.set(id, { sujet, description });
		const row = this.formService.createFormatSelect(id);
		await interaction.reply({
			content: 'Select the format for your proposal:',
			components: [row],
			ephemeral: true,
		});
	}

	async handleSelectFormat(interaction: any) {
		await interaction.deferUpdate();
		const format = interaction.values[0];
		const id = interaction.customId.split('|')[1];
		const proposal = this.pendingProposals.get(id);
		if (!proposal) {
			await interaction.followUp({
				content: 'Error: proposal not found.',
				ephemeral: true,
			});
			return;
		}
		proposal.format = format;
		this.pendingProposals.set(id, proposal);
		await interaction.editReply({
			content: `✅ Format selected: **${format}**`,
			components: [],
			ephemeral: true,
		});
		const row = this.formService.createContributorSelect(id);
		await interaction.followUp({
			content: 'Do you want to be a contributor for this idea?',
			components: [row],
			ephemeral: true,
		});
	}

	async handleSelectContributeur(interaction: any) {
		await interaction.deferUpdate();
		const contributeur = interaction.values[0] === 'yes';
		const id = interaction.customId.split('|')[1];
		const proposal = this.pendingProposals.get(id);
		if (!proposal) {
			await interaction.followUp({
				content: 'Error: proposal not found.',
				ephemeral: true,
			});
			return;
		}
		const { sujet, description, format } = proposal;
		await this.sendProposalToDiscordChannel({
			guildId: interaction.guild.id,
			sujet,
			description,
			format,
			contributeur,
			discordUserId: interaction.user.id,
		});
		try {
			const submitter = await this.userRepository.findOne({
				where: { discordId: interaction.user.id },
			});
			const discordServerForDb =
				await this.discordServerRepository.findOne({
					where: { guildId: interaction.guild.id },
					relations: ['community'],
				});
			if (!submitter) {
				this.logger.warn(
					`Discord user ${interaction.user.id} not found in database when creating proposal.`,
				);
			} else if (!discordServerForDb?.community) {
				this.logger.warn(
					`No community linked to Discord server when creating proposal.`,
				);
			} else {
				let existing = await this.proposalRepository.findOne({
					where: {
						title: sujet,
						format: format,
						submitter: { id: submitter.id },
						community: { id: discordServerForDb.community.id },
					},
					relations: ['submitter', 'community'],
				});
				if (!existing) {
					const proposalEntity = this.proposalRepository.create({
						title: sujet,
						description: description,
						format: format,
						isContributor: contributeur,
						status: 'in_progress',
						submitter: submitter,
						community: discordServerForDb.community,
					});
					await this.proposalRepository.save(proposalEntity);
				}
			}
		} catch (e) {
			this.logger.error('Error while creating proposal in database:', e);
		}
		this.pendingProposals.delete(id);
		try {
			await interaction.editReply({
				content: '✅ Your proposal has been sent for voting!',
				components: [],
				ephemeral: true,
			});
		} catch (e) {
			this.logger.error(
				'Error editing interaction (probably expired):',
				e,
			);
		}
	}

	async handleMessageReactionAdd(reaction: MessageReaction, user: User) {
		if (user.bot) return;
		const discordServer = await this.discordServerRepository.findOne({
			where: { guildId: reaction.message.guild.id },
			relations: ['community'],
		});
		await this.voteService.handleMessageReactionAdd(
			reaction,
			user,
			discordServer,
		);
	}

	async createChannelsIfNotExist(
		guildId: string,
		proposeName?: string,
		voteName?: string,
		resultName?: string,
	) {
		const client = this.discordClientService.getClient();
		try {
			const guild = await client.guilds.fetch(guildId);
			await guild.fetch();
			const created: string[] = [];
			const existing: string[] = [];
			const names = [proposeName, voteName, resultName].filter(Boolean);
			let salonIdees = null;
			let voteChannel = null;
			let resultChannel = null;
			if (names.length === 0) return { created, existing };
			for (const name of names) {
				const found = guild.channels.cache.find(
					(ch) =>
						ch.type === ChannelType.GuildText && ch.name === name,
				);
				if (found) {
					existing.push(name);
					if (name === (voteName ? voteName : undefined))
						voteChannel = found;
					if (name === (resultName ? resultName : undefined))
						resultChannel = found;
				} else {
					// TODO: dangereux d'avoir le nom en dur
					const role = guild.roles.cache.find(
						(r) => r.name === 'Snowledge Authenticated',
					);
					if (!role) {
						throw new Error(
							"Le rôle 'Snowledge Authenticated' n'existe pas sur ce serveur !",
						);
					}
					const createdChannel = await guild.channels.create({
						name,
						type: ChannelType.GuildText,
						permissionOverwrites: [
							{
								id: guild.roles.everyone.id,
								deny: ['ViewChannel'],
							},
							{
								id: role.id,
								allow: ['ViewChannel'],
								deny: ['SendMessages'],
							},
							{
								id: client.user.id,
								allow: ['ViewChannel', 'SendMessages'],
							},
						],
					});
					created.push(name);
					if (name === (proposeName ? proposeName : undefined))
						salonIdees = createdChannel;
					if (name === (voteName ? voteName : undefined))
						voteChannel = createdChannel;
					if (name === (resultName ? resultName : undefined))
						resultChannel = createdChannel;
				}
			}
			if (salonIdees) {
				try {
					const fetched = await salonIdees.messages.fetch({
						limit: 100,
					});
					if (fetched.size > 0)
						await salonIdees.bulkDelete(fetched, true);
				} catch (e) {}
				let voteChannelId = null;
				if (!voteName) {
					const discordServer =
						await this.discordServerRepository.findOne({
							where: { guildId: guildId },
						});
					voteChannelId = discordServer?.voteChannelId;
				} else {
					const voteChannel = guild.channels.cache.find(
						(ch) =>
							ch.type === ChannelType.GuildText &&
							ch.name === voteName,
					);
					voteChannelId = voteChannel?.id;
				}
				const explication = getSubmissionExplanation(voteChannelId);
				const button = this.formService.createIdeaButton();
				const sent = await salonIdees.send({
					content: explication,
					components: [button],
				});
				try {
					await sent.pin();
				} catch (e) {
					this.logger.error('Could not pin message:', e);
				}
			}
			if (voteChannel) {
				const voteExplanation = getVoteExplanation();
				const voteMsg = await voteChannel.send({
					content: voteExplanation,
				});
				try {
					await voteMsg.pin();
				} catch (e) {
					this.logger.error('Could not pin message:', e);
				}
			}
			if (resultChannel) {
				const resultExplanation = getResultExplanation();
				const resultMsg = await resultChannel.send({
					content: resultExplanation,
				});
				try {
					await resultMsg.pin();
				} catch (e) {
					this.logger.error('Could not pin message:', e);
				}
			}
			return { created, existing };
		} catch (e) {
			const err = e as Error;
			this.logger.error('Error creating Discord channels:', err);
			return {
				error: 'Error while creating channels',
				details: err.message,
			};
		}
	}

	async renameChannels(
		guildId: string,
		oldNames: { propose: string; vote: string; result: string },
		newNames: { propose: string; vote: string; result: string },
	) {
		const client = this.discordClientService.getClient();
		try {
			const guild = await client.guilds.fetch(guildId);
			await guild.fetch();
			const results = [];
			const pairs = [
				{ old: oldNames.propose, new: newNames.propose },
				{ old: oldNames.vote, new: newNames.vote },
				{ old: oldNames.result, new: newNames.result },
			];
			for (const { old, new: newName } of pairs) {
				const channel = guild.channels.cache.find(
					(ch) =>
						ch.type === ChannelType.GuildText && ch.name === old,
				);
				if (channel && channel.isTextBased()) {
					await channel.edit({ name: newName });
					results.push({ old, new: newName, status: 'renamed' });
				} else {
					results.push({ old, new: newName, status: 'not_found' });
				}
			}
			return { results };
		} catch (e) {
			const err = e as Error;
			this.logger.error('Error renaming Discord channels:', err);
			return {
				error: 'Error while renaming channels',
				details: err.message,
			};
		}
	}

	async listTextChannels(guildId: string) {
		const client = this.discordClientService.getClient();
		try {
			const guild = await client.guilds.fetch(guildId);
			await guild.fetch();
			const channels = guild.channels.cache
				.filter((ch) => ch.type === ChannelType.GuildText)
				.map((ch) => ({ id: ch.id, name: ch.name }));
			return channels;
		} catch (e) {
			const err = e as Error;
			this.logger.error('Error listing Discord channels:', err);
			return {
				error: 'Error while listing channels',
				details: err.message,
			};
		}
	}

	async sendProposalToDiscordChannel({
		guildId,
		sujet,
		description,
		format,
		contributeur,
		discordUserId,
	}: {
		guildId: string;
		sujet: string;
		description: string;
		format: string;
		contributeur: boolean;
		discordUserId: string;
	}) {
		const client = this.discordClientService.getClient();
		const discordServer = await this.discordServerRepository.findOne({
			where: { guildId: guildId },
		});
		const voteChannelId = discordServer?.voteChannelId;
		if (!voteChannelId)
			throw new Error('No vote channel assigned in database.');
		const guild = await client.guilds.fetch(guildId);
		const salonVotes = guild.channels.cache.get(voteChannelId);
		if (!salonVotes || salonVotes.type !== ChannelType.GuildText) {
			throw new Error(
				'The vote channel does not exist or is not a text channel.',
			);
		}
		const messageVote = await salonVotes.send(
			`📢 New idea proposed by <@${discordUserId}> :\n\n**Subject** : ${sujet}\n**Description** : ${description}\n**Format** : ${format}\n**Contributor** : ${contributeur ? 'Yes' : 'No'}\n\n**Vote Subject** : ✅ = Yes | ❌ = No\n**Vote Format** : 👍 = Yes | 👎 = No`,
		);
		await messageVote.react('✅');
		await messageVote.react('❌');
		await messageVote.react('👍');
		await messageVote.react('👎');
		return messageVote;
	}
}
