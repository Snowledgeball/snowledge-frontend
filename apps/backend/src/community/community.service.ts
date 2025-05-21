import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Community } from './community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunityService {
  constructor(
    @Inject('COMMUNITY_REPOSITORY')
    private communityRepository: Repository<Community>,
  ) {}

  async findAll(): Promise<Community[]> {
    return this.communityRepository.find();
  }

  async create(data: CreateCommunityDto): Promise<Community> {
    const community = this.communityRepository.create(data);
    return this.communityRepository.save(community);
  }
}
