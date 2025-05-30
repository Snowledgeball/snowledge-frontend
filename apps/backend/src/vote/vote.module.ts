import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote/vote.entity';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Vote, Community, User])],
	providers: [VoteService],
	controllers: [VoteController],
})
export class VoteModule {}
