import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from './entities/community.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Community])],
	providers: [CommunityService],
	controllers: [CommunityController],
	exports: [CommunityService],
})
export class CommunityModule {}
