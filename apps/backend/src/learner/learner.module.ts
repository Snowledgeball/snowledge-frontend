import { Module } from '@nestjs/common';
import { LearnerService } from './learner.service';
import { LearnerController } from './learner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learner } from './entities/learner/learner';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Learner, Community, User])],
	providers: [LearnerService],
	controllers: [LearnerController],
})
export class LearnerModule {}
