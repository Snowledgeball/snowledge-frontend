import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';
import { MessageReaction, User, ChannelType } from 'discord.js';
import {
	extractPropositionInfo,
	getVotersFromReaction,
} from '../utils/discord-proposal.utils';

@Injectable()
export class DiscordProposalVoteService {
	private readonly logger = new Logger(DiscordProposalVoteService.name);
	private readonly VOTES_NECESSAIRES = 1;

	constructor(
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
	) {}

	async handleMessageReactionAdd(
		reaction: MessageReaction,
		user: User,
		discordServer: any,
	) {
		const voteChannelId = discordServer?.voteChannelId;
		if (!voteChannelId)
			throw new Error('No vote channel assigned in database.');
		try {
			if (user.bot) return;
			const channel = reaction.message.channel;
			if (!('id' in channel) || channel.id !== voteChannelId) return;
			if (
				!reaction.message.content ||
				!reaction.message.content.startsWith('📢 New idea proposed by')
			)
				return;
			const { subject, format } = extractPropositionInfo(
				reaction.message.content ?? '',
			);
			const community = discordServer?.community
				? await this.communityRepository.findOne({
						where: { id: discordServer.community.id },
					})
				: null;
			if (!community) {
				this.logger.warn(
					`Community not found for Discord server ${reaction.message.guild.id}`,
				);
				return;
			}
			let proposal = await this.proposalRepository.findOne({
				where: {
					title: subject,
					format: format,
					community: { id: community.id },
				},
				relations: ['community'],
			});
			if (!proposal) {
				this.logger.error(
					`Critical inconsistency: Discord proposal (title: ${subject}, format: ${format}) does not exist in database during voting or status update.`,
				);
				return;
			}
			let voteType: 'subject' | 'format' | null = null;
			let voteValue: 'for' | 'against' | null = null;
			if (reaction.emoji.name === '✅') {
				voteType = 'subject';
				voteValue = 'for';
			} else if (reaction.emoji.name === '❌') {
				voteType = 'subject';
				voteValue = 'against';
			} else if (reaction.emoji.name === '👍') {
				voteType = 'format';
				voteValue = 'for';
			} else if (reaction.emoji.name === '👎') {
				voteType = 'format';
				voteValue = 'against';
			}
			if (voteType && voteValue) {
				const voter = await this.userRepository.findOne({
					where: { discordId: user.id },
				});
				if (!voter) {
					this.logger.warn(
						`Discord user ${user.id} not found in database`,
					);
					return;
				}
				let vote = await this.voteRepository.findOne({
					where: {
						proposal: { id: proposal.id },
						user: { id: voter.id },
					},
				});
				if (!vote) {
					if (voteType === 'format') {
						this.logger.warn(
							'[DiscordProposalVoteService] User tried to vote on format before voting on subject. Vote ignored.',
						);
						return;
					}
					vote = this.voteRepository.create({
						proposal,
						user: voter,
					});
				}
				if (voteType === 'subject') vote.choice = voteValue;
				else if (voteType === 'format') vote.formatChoice = voteValue;
				await this.voteRepository.save(vote);
			}
			let subjectYes = [],
				subjectNo = [],
				formatYes = [],
				formatNo = [];
			try {
				subjectYes = await getVotersFromReaction(reaction, '✅');
				subjectNo = await getVotersFromReaction(reaction, '❌');
				formatYes = await getVotersFromReaction(reaction, '👍');
				formatNo = await getVotersFromReaction(reaction, '👎');
			} catch (err: any) {
				if (err?.code === 10008) {
					this.logger.warn(
						'[DiscordBotService] Tried to fetch reactions for a message that no longer exists (probably deleted right after vote validation). This is normal if a user tried to react just after the message was deleted.',
					);
					return;
				}
				throw err;
			}
			const resultsChannelId = discordServer?.resultChannelId;
			if (!resultsChannelId)
				throw new Error('No results channel assigned in database.');
			const resultsChannel =
				reaction.message.guild.channels.cache.get(resultsChannelId);
			if (
				!resultsChannel ||
				resultsChannel.type !== ChannelType.GuildText
			) {
				throw new Error(
					'The results channel does not exist or is not a text channel.',
				);
			}
			let newStatus: 'accepted' | 'rejected' | null = null;
			if (subjectNo.length >= this.VOTES_NECESSAIRES) {
				await resultsChannel.send(
					`❌ The following proposal has been rejected:\n**Subject** : ${subject}\n**Format** : ${format}`,
				);
				newStatus = 'rejected';
				try {
					await reaction.message.delete();
				} catch (e) {}
			}
			if (subjectYes.length >= this.VOTES_NECESSAIRES) {
				await resultsChannel.send(
					`✅ The following proposal has been **approved**:\n**Subject** : ${subject}\n**Format** : ${format}`,
				);
				newStatus = 'accepted';
				try {
					await reaction.message.delete();
				} catch (e) {}
			}
			if (newStatus) {
				proposal.status = newStatus;
				await this.proposalRepository.save(proposal);
			}
		} catch (e) {
			this.logger.error('Error in MessageReactionAdd:', e);
		}
	}
}
