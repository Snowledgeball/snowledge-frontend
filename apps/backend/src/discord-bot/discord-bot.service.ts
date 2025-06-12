import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
	Client,
	GatewayIntentBits,
	Partials,
	Events,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
	ChannelType,
	MessageReaction,
	User,
	Interaction,
} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';

@Injectable()
export class DiscordBotService implements OnModuleInit {
	constructor(
		@InjectRepository(DiscordServer)
		private discordServerRepository: Repository<DiscordServer>,
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
	) {}

	private readonly logger = new Logger(DiscordBotService.name);
	private client: Client;
	// Nombre de votes nécessaires pour valider ou rejeter une proposition
	private readonly VOTES_NECESSAIRES = 1;
	private pendingProposals = new Map<
		string,
		{ sujet: string; description: string; format?: string }
	>();

	// Méthode appelée automatiquement par NestJS au démarrage du module
	onModuleInit() {
		this.startBot();
	}

	// Initialise et démarre le bot Discord
	private startBot() {
		// Création du client Discord avec les intents nécessaires
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
			],
			partials: [Partials.Message, Partials.Channel, Partials.Reaction],
		});

		// Log quand le bot est prêt
		this.client.once(Events.ClientReady, () => {
			this.logger.log(`✅ Connecté en tant que ${this.client.user?.tag}`);
		});

		// Gestion des interactions (slash commands, boutons, modals, select menus)
		this.client.on(
			Events.InteractionCreate,
			async (interaction: Interaction) => {
				if (
					interaction.isButton() &&
					interaction.customId === 'proposer_idee'
				) {
					await this.handleProposerIdee(interaction);
				} else if (
					interaction.isModalSubmit() &&
					interaction.customId === 'formulaire_idee_sujet'
				) {
					await this.handleModalSujet(interaction);
				} else if (
					interaction.isStringSelectMenu() &&
					interaction.customId.startsWith('choix_format|')
				) {
					await this.handleSelectFormat(interaction);
				} else if (
					interaction.isStringSelectMenu() &&
					interaction.customId.startsWith('choix_contributeur|')
				) {
					await this.handleSelectContributeur(interaction);
				}
			},
		);

		// Gestion des réactions sur les messages (votes)
		this.client.on(
			Events.MessageReactionAdd,
			async (
				reaction:
					| MessageReaction
					| import('discord.js').PartialMessageReaction,
				user: User | import('discord.js').PartialUser,
			) => {
				// On complète les objets partiels si besoin (cas des messages non-cachés)
				if (reaction.partial) {
					try {
						await reaction.fetch();
					} catch (e) {
						this.logger.error(
							'Impossible de fetch la réaction partielle',
							e,
						);
						return;
					}
				}
				if (user.partial) {
					try {
						await user.fetch();
					} catch (e) {
						this.logger.error(
							"Impossible de fetch l'utilisateur partiel",
							e,
						);
						return;
					}
				}
				await this.handleMessageReactionAdd(
					reaction as MessageReaction,
					user as User,
				);
			},
		);

		// Récupération du token Discord depuis les variables d'environnement
		const token = process.env.DISCORD_TOKEN;
		if (!token) {
			this.logger.error(
				"DISCORD_TOKEN n'est pas défini dans les variables d'environnement !",
			);
			return;
		}
		// Connexion du bot à Discord
		this.client.login(token);
	}

	// === UTILS ===
	// Récupère un salon textuel par son nom dans un serveur Discord
	private getTextChannelByName(guild: any, name: string) {
		return guild.channels.cache.find(
			(ch: any) => ch.name === name && ch.type === ChannelType.GuildText,
		);
	}

	// Donne le chemin absolu du fichier votes.json (stockage local des votes)
	private getVotesFilePath() {
		return path.join(__dirname, 'votes.json');
	}

	// Lit le fichier votes.json et retourne son contenu (ou un tableau vide si absent)
	private readVotes() {
		const votesPath = this.getVotesFilePath();
		if (fs.existsSync(votesPath)) {
			try {
				return JSON.parse(fs.readFileSync(votesPath, 'utf8'));
			} catch (e) {
				this.logger.error(
					'Erreur lors de la lecture de votes.json :',
					e,
				);
			}
		}
		return [];
	}

	// Écrit les données de votes dans votes.json
	private writeVotes(votesData: any) {
		const votesPath = this.getVotesFilePath();
		try {
			fs.writeFileSync(
				votesPath,
				JSON.stringify(votesData, null, 2),
				'utf8',
			);
			this.logger.log('Votes sauvegardés dans votes.json');
		} catch (err) {
			this.logger.error("Erreur lors de l'écriture de votes.json :", err);
		}
	}

	// Extrait les infos d'une proposition à partir du contenu du message Discord
	private extractPropositionInfo(messageContent: string) {
		const lines = messageContent.split('\n');
		const subject =
			lines
				.find((l) => l.startsWith('**Subject**'))
				?.replace('**Subject** : ', '')
				.trim() || '';
		const format =
			lines
				.find((l) => l.startsWith('**Format**'))
				?.replace('**Format** : ', '')
				.trim() || '';
		const proposedByMatch = messageContent.match(/by <@!?([0-9]+)>/);
		const proposedBy = proposedByMatch ? proposedByMatch[1] : null;
		return { subject, format, proposedBy };
	}

	// Récupère la liste des utilisateurs ayant voté avec un emoji donné sur une réaction
	private async getVotersFromReaction(
		reaction: MessageReaction,
		emoji: string,
	) {
		const react = reaction.message.reactions.cache.get(emoji);
		if (!react) return [];
		const users = await react.users.fetch();
		return users.filter((u: any) => !u.bot).map((u: any) => u.id);
	}

	// === HANDLERS ===
	// Gère le clic sur le bouton "Proposer une idée" : ouvre un modal pour saisir le sujet et la description
	private async handleProposerIdee(interaction: any) {
		const modal = new ModalBuilder()
			.setCustomId('formulaire_idee_sujet')
			.setTitle('Proposer une idée');
		const sujetInput = new TextInputBuilder()
			.setCustomId('sujet')
			.setLabel('Quel est le sujet ?')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		// AJOUT : champ description
		const descriptionInput = new TextInputBuilder()
			.setCustomId('description')
			.setLabel('Décris ton idée')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			sujetInput,
		);
		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			descriptionInput,
		);
		modal.addComponents(row1, row2);
		await interaction.showModal(modal);
	}

	// Gère la soumission du modal : propose un select menu pour choisir le format
	private async handleModalSujet(interaction: any) {
		const sujet = interaction.fields.getTextInputValue('sujet');
		const description = interaction.fields.getTextInputValue('description');
		const id = randomUUID();
		this.pendingProposals.set(id, { sujet, description });
		const select = new StringSelectMenuBuilder()
			.setCustomId(`choix_format|${id}`)
			.setPlaceholder('Choisis le format')
			.addOptions([
				{ label: 'Whitepaper', value: 'Whitepaper' },
				{ label: 'Masterclass', value: 'Masterclass' },
			]);
		const row = new ActionRowBuilder().addComponents(select);
		await interaction.reply({
			content: 'Sélectionne le format pour ta proposition :',
			components: [row],
			ephemeral: true,
		});
	}

	// Gère la sélection du format : publie la proposition dans #votes-idees et ajoute les réactions de vote
	private async handleSelectFormat(interaction: any) {
		// 1. Déférer la réponse dès le début
		await interaction.deferUpdate();
		const format = interaction.values[0];
		const id = interaction.customId.split('|')[1];
		const proposal = this.pendingProposals.get(id);
		if (!proposal) {
			await interaction.followUp({
				content: 'Erreur : proposition introuvable.',
				ephemeral: true,
			});
			return;
		}
		proposal.format = format;
		this.pendingProposals.set(id, proposal);

		// 1. Met à jour le message du select menu format pour indiquer que le format est validé
		await interaction.editReply({
			content: `✅ Format sélectionné : **${format}**`,
			components: [],
			ephemeral: true,
		});

		// 2. Affiche le select menu contributeur
		const select = new StringSelectMenuBuilder()
			.setCustomId(`choix_contributeur|${id}`)
			.setPlaceholder('Souhaitez-vous être contributeur ?')
			.addOptions([
				{ label: 'Oui', value: 'yes' },
				{ label: 'Non', value: 'no' },
			]);
		const row = new ActionRowBuilder().addComponents(select);
		await interaction.followUp({
			content: 'Souhaitez-vous être contributeur pour cette idée ?',
			components: [row],
			ephemeral: true,
		});
	}

	// Nouveau handler pour le choix contributeur
	private async handleSelectContributeur(interaction: any) {
		// 1. Déférer la réponse dès le début
		await interaction.deferUpdate();
		const contributeur = interaction.values[0] === 'yes';
		const id = interaction.customId.split('|')[1];
		const proposal = this.pendingProposals.get(id);
		if (!proposal) {
			await interaction.followUp({
				content: 'Erreur : proposition introuvable.',
				ephemeral: true,
			});
			return;
		}
		const { sujet, description, format } = proposal;
		const discordServer = await this.discordServerRepository.findOne({
			where: { discordGuildId: interaction.guild.id },
			relations: ['community'],
		});
		const voteChannelId = discordServer?.voteChannelId;
		if (!voteChannelId) {
			throw new Error('Aucun salon vote assigné en base.');
		}
		const salonVotes = interaction.guild.channels.cache.get(voteChannelId);
		if (!salonVotes || salonVotes.type !== ChannelType.GuildText) {
			throw new Error(
				"Le salon vote n'existe pas ou n'est pas un salon textuel.",
			);
		}
		const messageVote = await salonVotes.send(
			`📢 New idea proposed by <@${interaction.user.id}> :\n\n**Subject** : ${sujet}\n**Description** : ${description}\n**Format** : ${format}\n**Contributeur** : ${contributeur ? 'Oui' : 'Non'}\n\n**Vote Subject** : ✅ = Yes | ❌ = No\n**Vote Format** : 👍 = Yes | 👎 = No`,
		);
		await messageVote.react('✅');
		await messageVote.react('❌');
		await messageVote.react('👍');
		await messageVote.react('👎');
		let votesData = this.readVotes();
		votesData.push({
			subject: sujet,
			description,
			format,
			contributeur,
			proposedBy: interaction.user.id,
			status: 'pending',
			votes: {
				subject: { yes: [], no: [] },
				format: { yes: [], no: [] },
			},
		});
		this.writeVotes(votesData);
		// === Création de la proposition en BDD ===
		try {
			// Cherche l'utilisateur en BDD par son Discord ID
			const submitter = await this.userRepository.findOne({
				where: { discordId: interaction.user.id },
			});
			if (!submitter) {
				this.logger.warn(
					`Utilisateur Discord ${interaction.user.id} introuvable en BDD lors de la création de la proposition.`,
				);
			} else if (!discordServer?.community) {
				this.logger.warn(
					`Aucune communauté liée au serveur Discord lors de la création de la proposition.`,
				);
			} else {
				// Vérifie si la proposition existe déjà (évite doublon si double clic)
				let existing = await this.proposalRepository.findOne({
					where: {
						title: sujet,
						format: format,
						submitter: { id: submitter.id },
						community: { id: discordServer.community.id },
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
						community: discordServer.community,
						endDate: new Date(), // à adapter si tu veux une vraie date de fin
					});
					await this.proposalRepository.save(proposalEntity);
				}
			}
		} catch (e) {
			this.logger.error(
				'Erreur lors de la création de la proposition en BDD :',
				e,
			);
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

	// Gère l'ajout d'une réaction sur un message de vote : met à jour le JSON et annonce le résultat si besoin
	private async handleMessageReactionAdd(
		reaction: MessageReaction,
		user: User,
	) {
		const discordServer = await this.discordServerRepository.findOne({
			where: { discordGuildId: reaction.message.guild.id },
			relations: ['community'],
		});
		const voteChannelId = discordServer?.voteChannelId;
		if (!voteChannelId) {
			throw new Error('Aucun salon vote assigné en base.');
		}
		try {
			if (user.bot) return;
			// Vérifie que le channel est bien le bon
			const channel = reaction.message.channel;
			if (!('id' in channel) || channel.id !== voteChannelId) return;
			// Vérifie que le message est bien une proposition
			if (
				!reaction.message.content ||
				!reaction.message.content.startsWith('📢 New idea proposed by')
			)
				return;
			// Extrait les infos de la proposition
			const { subject, format, proposedBy } = this.extractPropositionInfo(
				reaction.message.content ?? '',
			);
			// Cherche la communauté liée au serveur Discord
			const community = discordServer?.community
				? await this.communityRepository.findOne({
						where: { id: discordServer.community.id },
					})
				: null;
			if (!community) {
				this.logger.warn(
					`Communauté introuvable pour le serveur Discord ${reaction.message.guild.id}`,
				);
				return;
			}
			// Cherche la proposition existante (toujours nécessaire)
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
					`Incohérence critique : la proposition Discord (title: ${subject}, format: ${format}) n'existe pas en BDD lors d'un vote ou d'une mise à jour de statut.`,
				);
				return;
			}
			// --- ENREGISTREMENT DU VOTE INDIVIDUEL ---
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
				// Cherche l'utilisateur en BDD par son Discord ID
				const voter = await this.userRepository.findOne({
					where: { discordId: user.id },
				});
				if (!voter) {
					this.logger.warn(
						`Utilisateur Discord ${user.id} introuvable en BDD`,
					);
					return;
				}
				// Vérifie si le vote existe déjà
				let vote = await this.voteRepository.findOne({
					where: {
						proposal: { id: proposal.id },
						user: { id: voter.id },
					},
				});
				if (!vote) {
					vote = this.voteRepository.create({
						proposal,
						user: voter,
					});
				}
				if (voteType === 'subject') {
					vote.choice = voteValue;
				} else if (voteType === 'format') {
					vote.formatChoice = voteValue;
				}
				await this.voteRepository.save(vote);
			}
			// --- LOGIQUE DE VALIDATION/REJET ---
			const subjectYes = await this.getVotersFromReaction(reaction, '✅');
			const subjectNo = await this.getVotersFromReaction(reaction, '❌');
			const formatYes = await this.getVotersFromReaction(reaction, '👍');
			const formatNo = await this.getVotersFromReaction(reaction, '👎');
			// Met à jour le JSON local
			const result = {
				subject,
				format,
				proposedBy,
				status: 'pending',
				votes: {
					subject: { yes: subjectYes, no: subjectNo },
					format: { yes: formatYes, no: formatNo },
				},
			};
			let votesData = this.readVotes();
			const index = votesData.findIndex(
				(v: any) => v.subject === subject && v.format === format,
			);
			if (index !== -1) {
				result.status = votesData[index].status || 'pending';
				votesData[index] = result;
			} else {
				votesData.push(result);
			}
			this.writeVotes(votesData);
			// Gestion du salon résultats
			const resultsChannelId = discordServer?.resultChannelId;
			if (!resultsChannelId) {
				throw new Error('Aucun salon résultats assigné en base.');
			}
			const resultsChannel =
				reaction.message.guild.channels.cache.get(resultsChannelId);
			if (
				!resultsChannel ||
				resultsChannel.type !== ChannelType.GuildText
			) {
				throw new Error(
					"Le salon résultats n'existe pas ou n'est pas un salon textuel.",
				);
			}
			// Statut à mettre à jour ?
			let newStatus: 'accepted' | 'rejected' | null = null;
			if (subjectNo.length >= this.VOTES_NECESSAIRES) {
				await resultsChannel.send(
					`❌ The following proposal has been rejected:\n**Subject** : ${subject}\n**Format** : ${format}`,
				);
				if (index !== -1) votesData[index].status = 'rejected';
				this.writeVotes(votesData);
				newStatus = 'rejected';
				try {
					await reaction.message.delete();
				} catch (e) {}
			}
			if (subjectYes.length >= this.VOTES_NECESSAIRES) {
				await resultsChannel.send(
					`✅ The following proposal has been **approved**:\n**Subject** : ${subject}\n**Format** : ${format}`,
				);
				if (index !== -1) votesData[index].status = 'approved';
				this.writeVotes(votesData);
				newStatus = 'accepted';
				try {
					await reaction.message.delete();
				} catch (e) {}
			}
			// --- ENREGISTREMENT EN BDD : update statut uniquement ---
			if (newStatus) {
				proposal.status = newStatus;
				await this.proposalRepository.save(proposal);
			}
		} catch (e) {
			this.logger.error('Error in MessageReactionAdd:', e);
		}
	}

	/**
	 * Crée les channels textuels s'ils n'existent pas déjà sur le serveur Discord
	 */
	async createChannelsIfNotExist(
		guildId: string,
		proposeName?: string,
		voteName?: string,
		resultName?: string,
	) {
		try {
			const guild = await this.client.guilds.fetch(guildId);
			await guild.fetch(); // S'assure que les channels sont bien chargés
			const created: string[] = [];
			const existing: string[] = [];

			const names = [proposeName, voteName, resultName].filter(Boolean);
			let salonIdees = null;
			// Si aucun nom n'est fourni, on ne crée pas de channels
			if (names.length === 0) {
				return { created, existing };
			}
			for (const name of names) {
				const found = guild.channels.cache.find(
					(ch) =>
						ch.type === ChannelType.GuildText && ch.name === name,
				);
				if (found) {
					existing.push(name);
				} else {
					const createdChannel = await guild.channels.create({
						name,
						type: ChannelType.GuildText,
					});
					created.push(name);
					if (name === proposeName) salonIdees = createdChannel;
				}
			}
			// Effectue le setup dans le salon de propositions
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
							where: { discordGuildId: guildId },
						});
					voteChannelId = discordServer?.voteChannelId;
				} else {
					const voteChannel = guild.channels.cache.find(
						(ch) =>
							ch.type === ChannelType.GuildText &&
							ch.name === voteName,
					);
					voteChannelId = voteChannel ? voteChannel.id : voteName;
				}
				const explication =
					'🎉 **Proposez vos idées !**\n\n' +
					'Pour proposer une idée :\n' +
					'1. Cliquez sur le bouton **📝 Proposer une idée** ci-dessous.\n' +
					'2. Saisissez le sujet de votre idée et sa description.\n' +
					'3. Sélectionnez le format souhaité (**Whitepaper** ou **Masterclass**).\n' +
					'4. Indiquez si vous souhaitez être contributeur pour cette idée.\n\n' +
					'Votre proposition sera ensuite envoyée dans le salon <#' +
					voteChannelId +
					'> pour que tout le monde puisse voter !';
				const button = new ButtonBuilder()
					.setCustomId('proposer_idee')
					.setLabel('📝 Proposer une idée')
					.setStyle(ButtonStyle.Primary);
				const row = new ActionRowBuilder().addComponents(button);
				const sent = await salonIdees.send({
					content: explication,
					components: [row],
				});
				try {
					await sent.pin();
				} catch (e) {}
			}
			return { created, existing };
		} catch (e) {
			const err = e as Error;
			this.logger.error('Erreur création channels Discord :', err);
			return {
				error: 'Erreur lors de la création des channels',
				details: err.message,
			};
		}
	}

	/**
	 * Renomme les channels textuels existants
	 */
	async renameChannels(
		guildId: string,
		oldNames: { propose: string; vote: string; result: string },
		newNames: { propose: string; vote: string; result: string },
	) {
		try {
			const guild = await this.client.guilds.fetch(guildId);
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
			this.logger.error('Erreur renommage channels Discord :', err);
			return {
				error: 'Erreur lors du renommage des channels',
				details: err.message,
			};
		}
	}

	/**
	 * Liste les channels textuels du serveur Discord
	 */
	async listTextChannels(guildId: string) {
		try {
			const guild = await this.client.guilds.fetch(guildId);
			await guild.fetch();
			const channels = guild.channels.cache
				.filter((ch) => ch.type === ChannelType.GuildText)
				.map((ch) => ({ id: ch.id, name: ch.name }));
			return channels;
		} catch (e) {
			const err = e as Error;
			this.logger.error('Erreur listing channels Discord :', err);
			return {
				error: 'Erreur lors du listing des channels',
				details: err.message,
			};
		}
	}
}
