import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { Proposal } from '../proposal/entities/proposal/proposal.entity';
import { User } from '../user/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Vote, Proposal, User])],
	providers: [VoteService],
	controllers: [VoteController],
})
export class VoteModule {}
