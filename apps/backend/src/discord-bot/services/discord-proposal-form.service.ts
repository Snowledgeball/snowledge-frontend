import { Injectable } from '@nestjs/common';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
} from 'discord.js';

@Injectable()
export class DiscordProposalFormService {
	createIdeaModal() {
		const modal = new ModalBuilder()
			.setCustomId('formulaire_idee_sujet')
			.setTitle('Propose an idea');
		const sujetInput = new TextInputBuilder()
			.setCustomId('sujet')
			.setLabel('What is the subject?')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		const descriptionInput = new TextInputBuilder()
			.setCustomId('description')
			.setLabel('Describe your idea')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			sujetInput,
		);
		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			descriptionInput,
		);
		modal.addComponents(row1, row2);
		return modal;
	}

	createFormatSelect(id: string) {
		const select = new StringSelectMenuBuilder()
			.setCustomId(`choix_format|${id}`)
			.setPlaceholder('Choose the format')
			.addOptions([
				{ label: 'Whitepaper', value: 'Whitepaper' },
				{ label: 'Masterclass', value: 'Masterclass' },
			]);
		const row = new ActionRowBuilder().addComponents(select);
		return row;
	}

	createContributorSelect(id: string) {
		const select = new StringSelectMenuBuilder()
			.setCustomId(`choix_contributeur|${id}`)
			.setPlaceholder('Do you want to be a contributor?')
			.addOptions([
				{ label: 'Yes', value: 'yes' },
				{ label: 'No', value: 'no' },
			]);
		const row = new ActionRowBuilder().addComponents(select);
		return row;
	}

	createIdeaButton() {
		return new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('proposer_idee')
				.setLabel('📝 Submit an idea')
				.setStyle(ButtonStyle.Primary),
		);
	}
}
