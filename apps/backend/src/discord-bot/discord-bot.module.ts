import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';

@Module({
	imports: [TypeOrmModule.forFeature([DiscordServer])],
	controllers: [DiscordBotController],
	providers: [DiscordBotService],
})
export class DiscordBotModule {}
