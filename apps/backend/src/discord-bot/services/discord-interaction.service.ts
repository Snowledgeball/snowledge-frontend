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
	}
}
