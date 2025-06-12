import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';

@Injectable()
export class DiscordClientService implements OnModuleInit {
	private readonly logger = new Logger(DiscordClientService.name);
	private client: Client;

	onModuleInit() {
		this.initClient();
	}

	private initClient() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
			],
			partials: [Partials.Message, Partials.Channel, Partials.Reaction],
		});
		this.client.once(Events.ClientReady, () => {
			this.logger.log(`✅ Connected as ${this.client.user?.tag}`);
		});
		const token = process.env.DISCORD_BOT_TOKEN;
		if (!token) {
			this.logger.error(
				'DISCORD_BOT_TOKEN is not defined in environment variables!',
			);
			return;
		}
		this.client.login(token);
	}

	getClient(): Client {
		return this.client;
	}
}
