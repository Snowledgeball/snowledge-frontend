import { Module } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { DiscordBotController } from './discord-bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			DiscordServer,
			Proposal,
			UserEntity,
			Community,
			Vote,
		]),
	],
	controllers: [DiscordBotController],
	providers: [DiscordBotService],
})
export class DiscordBotModule {}
