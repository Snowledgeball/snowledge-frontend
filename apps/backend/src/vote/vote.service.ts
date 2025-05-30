import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto/create-vote.dto';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class VoteService {
	constructor(
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findAllForACommunityBySlug(communitySlug: string): Promise<Vote[]> {
		return this.voteRepository.find({
			where: { community: { slug: communitySlug } },
			relations: ['community', 'submitter'],
		});
	}

	async findOne(id: number, communitySlug: string): Promise<Vote> {
		const vote = await this.voteRepository.findOne({
			where: { id, community: { slug: communitySlug } },
			relations: ['community', 'submitter'],
		});
		if (!vote) throw new NotFoundException('Vote not found');
		return vote;
	}

	async create(
		createVoteDto: CreateVoteDto,
		communitySlug: string,
	): Promise<Vote> {
		const { communityId, submitterId, ...rest } = createVoteDto;
		const community = await this.communityRepository.findOne({
			where: { slug: communitySlug },
			relations: ['user'],
		});
		const submitter = await this.userRepository.findOne({
			where: { id: submitterId },
			relations: ['communities'],
		});
		if (
			!community ||
			!submitter ||
			!submitter.communities.some((c) => c.id === community.id)
		)
			throw new NotFoundException('Community or user not found');
		const vote = this.voteRepository.create({
			...rest,
			community,
			submitter,
		});
		return this.voteRepository.save(vote);
	}
}
