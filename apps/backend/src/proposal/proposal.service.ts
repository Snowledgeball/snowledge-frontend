import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
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

	async findAllForACommunityBySlug(
		communitySlug: string,
	): Promise<Proposal[]> {
		const proposals = await this.proposalRepository.find({
			where: { community: { slug: communitySlug } },
			relations: [
				'community',
				'submitter',
				'community.learners',
				'votes',
			],
		});
		const now = new Date();
		const toUpdate: Proposal[] = [];
		proposals.forEach((proposal) => {
			if (proposal.status === 'in_progress' && proposal.endDate < now) {
				proposal.status = 'rejected';
				toUpdate.push(proposal);
			}
		});
		if (toUpdate.length > 0) {
			await this.proposalRepository.save(toUpdate);
		}
		return proposals;
	}

	async findOne(id: number, communitySlug: string): Promise<Proposal> {
		const proposal = await this.proposalRepository.findOne({
			where: { id, community: { slug: communitySlug } },
			relations: ['community', 'submitter'],
		});
		if (!proposal) throw new NotFoundException('Proposal not found');

		// Expiration automatique à la lecture
		if (
			proposal.status === 'in_progress' &&
			proposal.endDate < new Date()
		) {
			proposal.status = 'rejected';
			await this.proposalRepository.save(proposal);
		}

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
			relations: ['communities', 'learners'],
		});
		if (
			!community ||
			!submitter ||
			(!submitter.communities.some((c) => c.id === community.id) &&
				!submitter.learners.some(
					(l) => l.community.id === community.id,
				))
		) {
			throw new NotFoundException('Community or user not found');
		}

		// Si endDate n'est pas fourni, on met J+5 à partir de maintenant
		const endDate = createProposalDto.endDate
			? new Date(createProposalDto.endDate)
			: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

		const proposal = this.proposalRepository.create({
			...rest,
			community,
			submitter,
			endDate,
		});
		return this.proposalRepository.save(proposal);
	}

	async updateProposalStatus(proposal: Proposal, community: Community) {
		const now = new Date();
		const totalLearners = community.learners.length;
		const votes = proposal.votes.length;
		console.log('votes', votes);
		console.log('totalLearners', totalLearners);
		const quorumReached = votes > totalLearners / 2;
		const timeOver = now > new Date(proposal.endDate);
		console.log('quorumReached', quorumReached);
		// console.log('timeOver', timeOver);
		// console.log('AZAZAZAZ');

		if (proposal.status !== 'in_progress') return proposal; // déjà terminé

		if (quorumReached || timeOver) {
			const yesVotes = proposal.votes.filter(
				(v) => v.choice === 'for',
				console.log('yesVotes'),
			).length;
			const noVotes = proposal.votes.filter(
				(v) => v.choice === 'against',
				console.log('noVotes'),
			).length;
			proposal.status = yesVotes > noVotes ? 'accepted' : 'rejected';
			await this.proposalRepository.save(proposal);
			console.log('proposal.status');
		}
		return proposal;
	}
}
