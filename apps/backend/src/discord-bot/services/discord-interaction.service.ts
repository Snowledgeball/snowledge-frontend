import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	Events,
	Interaction,
	MessageReaction,
	PartialMessageReaction,
	User,
	PartialUser,
} from 'discord.js';
import { DiscordClientService } from './discord-client.service';
import { DiscordProposalService } from './discord-proposal.service';

@Injectable()
export class DiscordInteractionService implements OnModuleInit {
	private readonly logger = new Logger(DiscordInteractionService.name);

	constructor(
		private readonly discordClientService: DiscordClientService,
		private readonly discordProposalService: DiscordProposalService,
	) {}

	onModuleInit() {
		this.registerListeners();
	}

	private registerListeners() {
		const client = this.discordClientService.getClient();
		client.on(
			Events.InteractionCreate,
			async (interaction: Interaction) => {
				try {
					if (
						interaction.isButton() &&
						interaction.customId === 'proposer_idee'
					) {
						await this.discordProposalService.handleProposerIdee(
							interaction,
						);
					} else if (
						interaction.isModalSubmit() &&
						interaction.customId === 'formulaire_idee_sujet'
					) {
						await this.discordProposalService.handleModalSujet(
							interaction,
						);
					} else if (
						interaction.isStringSelectMenu() &&
						interaction.customId.startsWith('choix_format|')
					) {
						await this.discordProposalService.handleSelectFormat(
							interaction,
						);
					} else if (
						interaction.isStringSelectMenu() &&
						interaction.customId.startsWith('choix_contributeur|')
					) {
						await this.discordProposalService.handleSelectContributeur(
							interaction,
						);
					}
				} catch (e) {
					this.logger.error(
						"Erreur lors du traitement de l'interaction Discord",
						e,
					);
				}
			},
		);
		client.on(
			Events.MessageReactionAdd,
			async (
				reaction: MessageReaction | PartialMessageReaction,
				user: User | PartialUser,
			) => {
				try {
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
					await this.discordProposalService.handleMessageReactionAdd(
						reaction as MessageReaction,
						user as User,
					);
				} catch (e) {
					this.logger.error(
						'Erreur lors du traitement de la réaction Discord',
						e,
					);
				}
			},
		);

		client.on(Events.GuildCreate, async (guild) => {
			try {
				// Vérifier si le rôle existe déjà
				let role = guild.roles.cache.find(
					(r) => r.name === 'Snowledge Authenticated',
				);
				if (!role) {
					role = await guild.roles.create({
						name: 'Snowledge Authenticated',
						color: 'Blue',
						mentionable: true,
						permissions: [], // Permissions minimales
					});
					this.logger.log(
						`Rôle 'Snowledge Authenticated' créé sur le serveur ${guild.name}`,
					);
				} else {
					this.logger.log(
						`Rôle 'Snowledge Authenticated' déjà existant sur le serveur ${guild.name}`,
					);
				}

				// Vérifier si le salon existe déjà
				let channel = guild.channels.cache.find(
					(c) =>
						c.name === 'validation-cgu-snowledge' && c.type === 0, // 0 = GUILD_TEXT
				);
				if (!channel) {
					// TODO: dangereux d'avoir le nom en dur
					const role = guild.roles.cache.find(
						(r) => r.name === 'Snowledge Authenticated',
					);
					if (!role) {
						throw new Error(
							"Le rôle 'Snowledge Authenticated' n'existe pas sur ce serveur !",
						);
					}

					channel = await guild.channels.create({
						name: 'validation-cgu-snowledge',
						type: 0, // GUILD_TEXT
						topic: 'Salon pour valider les CGU et autoriser Snowledge',
						permissionOverwrites: [
							{
								id: guild.roles.everyone.id,
								allow: ['ViewChannel'],
								deny: ['SendMessages'],
							},
							{
								id: role.id,
								deny: ['ViewChannel'],
							},
							{
								id: client.user.id,
								allow: ['ViewChannel', 'SendMessages'],
							},
						],
					});
					this.logger.log(
						`Salon 'validation-cgu-snowledge' créé sur le serveur ${guild.name}`,
					);

					// Génération dynamique de l'URL OAuth2
					const params = new URLSearchParams({
						client_id: process.env.DISCORD_CLIENT_ID,
						redirect_uri: process.env.DISCORD_REDIRECT_URI,
						response_type: 'code',
						scope: 'identify email',
						prompt: 'consent',
						state: guild.id,
					});
					const oauthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
					const {
						ActionRowBuilder,
						ButtonBuilder,
						ButtonStyle,
					} = require('discord.js');
					const row = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setLabel('Autoriser Snowledge')
							.setStyle(ButtonStyle.Link)
							.setURL(oauthUrl),
					);
					const message = await channel.send({
						content: `Afin de pouvoir accéder aux fonctionnalités de Snowledge, vous devez accepter les conditions suivantes et autoriser la connexion à votre compte Discord.`,
						components: [row],
					});
					await message.pin();
					this.logger.log(
						`Message d'autorisation envoyé et épinglé dans 'validation-cgu-snowledge' sur ${guild.name}`,
					);
				} else {
					this.logger.log(
						`Salon 'validation-cgu-snowledge' déjà existant sur le serveur ${guild.name}`,
					);
				}
			} catch (e) {
				this.logger.error(
					`Erreur lors de la création du rôle, du salon ou de l'envoi du message sur le serveur ${guild.name}`,
					e,
				);
			}
		});
	}
}
