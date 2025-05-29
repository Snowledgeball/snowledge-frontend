import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Learner, LearnerStatus } from './entities/learner/learner';
import { Repository } from 'typeorm';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class LearnerService {
	constructor(
		@InjectRepository(Learner)
		private readonly learnerRepository: Repository<Learner>,
		@InjectRepository(Community)
		private readonly communityRepository: Repository<Community>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async addLearnerToCommunity(
		slug: string,
		userId: number,
		isContributor: boolean = false,
	) {
		const community = await this.communityRepository.findOne({
			where: { slug },
		});
		if (!community) throw new NotFoundException('Community not found');
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});
		if (!user) throw new NotFoundException('User not found');

		// Vérifie si déjà membre
		const existing = await this.learnerRepository.findOne({
			where: { community: { id: community.id }, user: { id: user.id } },
		});
		if (existing) return existing;

		const learner = this.learnerRepository.create({
			community,
			user,
			isContributor,
		});
		return this.learnerRepository.save(learner);
	}

	async getLearnersByCommunitySlug(slug: string) {
		const community = await this.communityRepository.findOne({
			where: { slug },
		});
		if (!community) throw new NotFoundException('Community not found');
		return this.learnerRepository.find({
			where: {
				community: { id: community.id },
				status: LearnerStatus.MEMBER,
			},
			relations: ['user'],
		});
	}

	async removeLearnerFromCommunity(slug: string, userId: number) {
		const community = await this.communityRepository.findOne({
			where: { slug },
		});
		if (!community) throw new NotFoundException('Community not found');
		const learner = await this.learnerRepository.findOne({
			where: { community: { id: community.id }, user: { id: userId } },
		});
		if (!learner) throw new NotFoundException('Learner not found');
		await this.learnerRepository.remove(learner);
		return { success: true };
	}

	async updateLearnerContributor(
		slug: string,
		userId: number,
		isContributor: boolean,
	) {
		const community = await this.communityRepository.findOne({
			where: { slug },
		});
		if (!community) throw new NotFoundException('Community not found');
		const learner = await this.learnerRepository.findOne({
			where: { community: { id: community.id }, user: { id: userId } },
			relations: ['user', 'community'],
		});
		if (!learner) throw new NotFoundException('Learner not found');
		learner.isContributor = isContributor;
		return this.learnerRepository.save(learner);
	}
}
