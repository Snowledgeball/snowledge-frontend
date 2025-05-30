import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal/proposal.entity';
import { CreateProposalDto } from './dto/create-proposal.dto/create-proposal.dto';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProposalService {
	constructor(
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async findAllForACommunityBySlug(communitySlug: string): Promise<Proposal[]> {
		return this.proposalRepository.find({
			where: { community: { slug: communitySlug } },
			relations: ['community', 'submitter'],
		});
	}

	async findOne(id: number, communitySlug: string): Promise<Proposal> {
		const proposal = await this.proposalRepository.findOne({
			where: { id, community: { slug: communitySlug } },
			relations: ['community', 'submitter'],
		});
		if (!proposal) throw new NotFoundException('Proposal not found');
		return proposal;
	}

	async create(
		createProposalDto: CreateProposalDto,
		communitySlug: string,
	): Promise<Proposal> {
		const { communityId, submitterId, ...rest } = createProposalDto;
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
		const proposal = this.proposalRepository.create({
			...rest,
			community,
			submitter,
		});
		return this.proposalRepository.save(proposal);
	}
}
