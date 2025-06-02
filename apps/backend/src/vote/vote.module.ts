import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { Proposal } from '../proposal/entities/proposal.entity';
import { User } from '../user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { ProposalService } from 'src/proposal/proposal.service';

@Module({
	imports: [TypeOrmModule.forFeature([Vote, Proposal, User, Community])],
	providers: [VoteService, ProposalService],
	controllers: [VoteController],
})
export class VoteModule {}
