import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';

@Module({
	providers: [DiscordBotService],
})
export class DiscordBotModule {}
