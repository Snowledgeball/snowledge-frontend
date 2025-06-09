import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';

@Module({
	controllers: [DiscordBotController],
	providers: [DiscordBotService],
})
export class DiscordBotModule {}
