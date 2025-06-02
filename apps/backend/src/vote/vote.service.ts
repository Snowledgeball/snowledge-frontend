import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ProposalService } from 'src/proposal/proposal.service';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { Community } from 'src/community/entities/community.entity';

@Injectable()
export class VoteService {
	constructor(
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		private proposalService: ProposalService,
	) {}

	async create(proposalId: number, createVoteDto: CreateVoteDto) {
		// 1. Récupérer la proposition et la communauté associée
		const proposal = await this.proposalRepository.findOne({
			where: { id: proposalId },
			relations: ['community', 'votes'],
		});
		if (!proposal) throw new NotFoundException('Proposal not found');

		const community = await this.communityRepository.findOne({
			where: { id: proposal.community.id },
			relations: ['learners'],
		});
		if (!community) throw new NotFoundException('Community not found');

		// 2. Créer et sauvegarder le vote
		const vote = this.voteRepository.create({
			...createVoteDto,
			proposal,
			user: { id: createVoteDto.userId },
		});
		await this.voteRepository.save(vote);

		// Recharge la proposition avec les votes à jour
		const updatedProposal = await this.proposalRepository.findOne({
			where: { id: proposalId },
			relations: ['community', 'votes'],
		});

		await this.proposalService.updateProposalStatus(
			updatedProposal,
			community,
		);

		return vote;
	}

	async findAllByUserId(communitySlug: string, userId: number) {
		return this.voteRepository.find({
			where: {
				proposal: {
					community: {
						slug: communitySlug,
					},
				},
				user: {
					id: userId,
				},
			},
			relations: {
				proposal: true,
				user: true,
			},
		});
	}
}
