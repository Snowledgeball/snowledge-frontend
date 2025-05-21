import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { communityProviders } from './community.providers';
import { DatabaseModule } from '../database/database.module';
import { CommunityController } from './community.controller';

@Module({
  imports: [DatabaseModule],
  providers: [...communityProviders, CommunityService],
  controllers: [CommunityController],
  exports: [CommunityService],
})
export class CommunityModule {}
