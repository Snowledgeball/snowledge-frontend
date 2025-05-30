import { Module } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal/proposal.entity';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Proposal, Community, User])],
	providers: [ProposalService],
	controllers: [ProposalController],
})
export class ProposalModule {}
