import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { communityProviders } from './community.providers';
import { CommunityController } from './community.controller';

@Module({
	providers: [...communityProviders, CommunityService],
	controllers: [CommunityController],
	exports: [CommunityService],
})
export class CommunityModule {}
