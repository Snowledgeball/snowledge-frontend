import {
	Injectable,
	Inject,
	NotFoundException,
	Param,
	Post,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { User } from 'src/user/entities/user.entity';
import { LearnerStatus } from 'src/learner/entities/learner/learner';

@Injectable()
export class CommunityService {
	constructor(
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
	) {}

	async findAll(): Promise<Community[]> {
		return this.communityRepository.find();
	}

	async findAllByUser(userId: number): Promise<Community[]> {
		const ownedCommunities = await this.communityRepository.find({
			where: { user: { id: userId } },
		});
		const learnerCommunities = await this.communityRepository.find({
			where: {
				learners: {
					user: { id: userId },
					status: LearnerStatus.MEMBER,
				},
			},
		});
		return [...ownedCommunities, ...learnerCommunities];
	}

	async create(data: CreateCommunityDto): Promise<Community> {
		const community = this.communityRepository.create({
			...data,
			user: { id: data.user },
			slug: slugify(data.name, { lower: true, strict: true }),
		});
		return this.communityRepository.save(community);
	}

	async findOneByDiscordServerId(
		discordServerId: string,
	): Promise<Community> {
		return this.communityRepository.findOne({
			where: { discordServer: { guildId: discordServerId } },
		});
	}

	async findOneBySlug(slug: string): Promise<Community> {
		return this.communityRepository.findOne({ where: { slug } });
	}

	async findOneByName(name: string): Promise<Community> {
		return this.communityRepository.findOne({ where: { name } });
	}

	async findOneById(id: number): Promise<Community> {
		return this.communityRepository.findOne({ where: { id } });
	}

	async getCommunityCreatorFromSlug(slug: string): Promise<User> {
		const community = await this.findOneBySlug(slug);
		return community.user;
	}

	// TODO rename / refacto ???
	async update(id: number, data: UpdateCommunityDto): Promise<Community> {
		const community = await this.communityRepository.findOne({
			where: { id },
		});
		if (!community) {
			throw new NotFoundException('Community not found');
		}
		const slug = slugify(data.name, { lower: true, strict: true });
		return this.communityRepository.save({
			...community,
			...data,
			slug,
		});
	}
}
