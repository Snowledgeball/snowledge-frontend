import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		private readonly dataSource: DataSource,
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
			await this.dataSource.transaction(
				async (transactionalEntityManager) => {
					const proposal = await transactionalEntityManager
						.getRepository(Proposal)
						.findOne({
							where: {
								title: subject,
								format: format,
								community: { id: community.id },
							},
							relations: ['community'],
							lock: { mode: 'pessimistic_write' },
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
						const voter = await transactionalEntityManager
							.getRepository(UserEntity)
							.findOne({ where: { discordId: user.id } });
						if (!voter) {
							this.logger.warn(
								`Discord user ${user.id} not found in database`,
							);
							return;
						}
						let vote = await transactionalEntityManager
							.getRepository(Vote)
							.findOne({
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
							vote = transactionalEntityManager
								.getRepository(Vote)
								.create({ proposal, user: voter });
						}
						if (voteType === 'subject') {
							vote.choice = voteValue;
							const userId = user.id;
							let formatChoice: 'for' | 'against' | undefined;
							const formatReactions =
								reaction.message.reactions.cache.filter(
									(r) =>
										r.emoji.name === '👍' ||
										r.emoji.name === '👎',
								);
							for (const r of formatReactions.values()) {
								const users = await r.users.fetch();
								if (users.has(userId)) {
									formatChoice =
										r.emoji.name === '👍'
											? 'for'
											: 'against';
									break;
								}
							}
							if (formatChoice) {
								vote.formatChoice = formatChoice;
							}
						} else if (voteType === 'format') {
							vote.formatChoice = voteValue;
						}
						await transactionalEntityManager
							.getRepository(Vote)
							.save(vote);
					}
					let subjectYes = [],
						subjectNo = [],
						formatYes = [],
						formatNo = [];
					try {
						subjectYes = await getVotersFromReaction(
							reaction,
							'✅',
						);
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
						throw new Error(
							'No results channel assigned in database.',
						);
					const resultsChannel =
						reaction.message.guild.channels.cache.get(
							resultsChannelId,
						);
					if (
						!resultsChannel ||
						resultsChannel.type !== ChannelType.GuildText
					) {
						throw new Error(
							'The results channel does not exist or is not a text channel.',
						);
					}
					if (
						subjectNo.length >= this.VOTES_NECESSAIRES &&
						proposal.status !== 'rejected' &&
						proposal.status !== 'accepted'
					) {
						proposal.status = 'rejected';
						proposal.endedAt = new Date();

						await transactionalEntityManager.save(proposal);
						await resultsChannel.send(
							`❌ The following proposal has been rejected:\n**Subject** : ${subject}\n**Format** : ${format}`,
						);
						try {
							await reaction.message.delete();
						} catch (e) {}
						return;
					}
					if (
						subjectYes.length >= this.VOTES_NECESSAIRES &&
						proposal.status !== 'accepted' &&
						proposal.status !== 'rejected'
					) {
						proposal.status = 'accepted';
						proposal.endedAt = new Date();

						// Vérifier les votes du format
						let finalFormat = format;
						if (formatNo.length >= formatYes.length) {
							// Si les votes non sont supérieurs ou égaux aux votes oui, on met "toBeDefined"
							finalFormat = 'toBeDefined';
							proposal.format = 'toBeDefined';
						}

						await transactionalEntityManager.save(proposal);

						// Adapter le message selon le résultat du format
						const formatMessage =
							finalFormat === 'toBeDefined'
								? 'To be defined (format refused)'
								: format;

						await resultsChannel.send(
							`✅ The following proposal has been **approved**:\n**Subject** : ${subject}\n**Format** : ${formatMessage}`,
						);
						try {
							await reaction.message.delete();
						} catch (e) {}
						return;
					}
				},
			);
		} catch (e) {
			this.logger.error('Error in MessageReactionAdd:', e);
		}
	}
}
