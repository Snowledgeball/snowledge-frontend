import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';

@Injectable()
export class CommunityService {
	constructor(
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
	) {}

	async findAll(): Promise<Community[]> {
		return this.communityRepository.find();
	}

	async findOneBySlug(slug: string): Promise<Community> {
		return this.communityRepository.findOne({ where: { slug } });
	}

	async create(data: CreateCommunityDto): Promise<Community> {
		const community = this.communityRepository.create({
			...data,
			user: { id: data.user },
			slug: slugify(data.name, { lower: true, strict: true }),
		});
		return this.communityRepository.save(community);
	}
}
