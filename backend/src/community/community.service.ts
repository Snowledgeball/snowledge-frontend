import { Injectable } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto/create-community.dto';
import { Community } from './entities/community.entity/community.entity';
@Injectable()
export class CommunityService {
  private communities: Community[] = [];

  create(dto: CreateCommunityDto, ownerId: string): Community {
    const community: Community = {
      id: Date.now().toString(),
      ...dto,
      ownerId,
      members: [ownerId],
      createdAt: new Date(),
    };
    this.communities.push(community);
    return community;
  }

  findAll(): Community[] {
    return this.communities;
  }
}
