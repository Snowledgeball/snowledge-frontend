import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Discord Bot')
@Controller('discord-bot')
export class DiscordBotController {
	constructor(private readonly discordBotService: DiscordBotService) {}

	// Endpoint pour créer les channels si besoin
	@Post('create-channels')
	async createChannels(
		@Body()
		body: {
			guildId: string;
			proposeName?: string;
			voteName?: string;
			resultName?: string;
		},
	) {
		return this.discordBotService.createChannelsIfNotExist(
			body.guildId,
			body.proposeName,
			body.voteName,
			body.resultName,
		);
	}

	// Endpoint pour renommer les channels
	@Post('rename-channels')
	async renameChannels(
		@Body()
		body: {
			guildId: string;
			oldNames: { propose: string; vote: string; result: string };
			newNames: { propose: string; vote: string; result: string };
		},
	) {
		return this.discordBotService.renameChannels(
			body.guildId,
			body.oldNames,
			body.newNames,
		);
	}

	// Endpoint pour lister les channels textuels (GET avec query param)
	@Get('list-channels')
	async listChannels(@Query('guildId') guildId: string) {
		return this.discordBotService.listTextChannels(guildId);
	}
}
