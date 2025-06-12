import { Module } from '@nestjs/common';
import { DiscordBotController } from './discord-bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';
import { DiscordClientService } from './services/discord-client.service';
import { DiscordInteractionService } from './services/discord-interaction.service';
import { DiscordProposalService } from './services/discord-proposal.service';
import { DiscordProposalFormService } from './services/discord-proposal-form.service';
import { DiscordProposalVoteService } from './services/discord-proposal-vote.service';

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
	providers: [
		DiscordClientService,
		DiscordInteractionService,
		DiscordProposalService,
		DiscordProposalFormService,
		DiscordProposalVoteService,
	],
	exports: [
		DiscordClientService,
		DiscordInteractionService,
		DiscordProposalService,
		DiscordProposalFormService,
		DiscordProposalVoteService,
	],
})
export class DiscordBotModule {}
