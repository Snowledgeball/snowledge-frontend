import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
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
			relations: ['user'],
		});
		if (!community) throw new NotFoundException('Community not found');
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});
		if (!user) throw new NotFoundException('User not found');

		//Vérifie si c'est pas le créateur de la communauté
		if (community.user.id === user.id)
			throw new BadRequestException('You cannot join your own community');

		// Vérifie si déjà membre
		const existing = await this.learnerRepository.findOne({
			where: { community: { id: community.id }, user: { id: user.id } },
		});
		if (existing) throw new BadRequestException('User already a member');

		const learner = this.learnerRepository.create({
			community,
			user,
			isContributor,
		});
		return this.learnerRepository.save(learner);
	}

	// Methode simple pour créer un learner
	async create(userId: number, communityId: number) {
		const learner = this.learnerRepository.create({
			community: { id: communityId },
			user: { id: userId },
			status: LearnerStatus.MEMBER,
			isContributor: false,
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

	async inviteUserToCommunity(
		slug: string,
		userId: number,
		currentUserId: number,
	) {
		if (userId === currentUserId) {
			throw new BadRequestException(
				'Vous ne pouvez pas vous inviter vous-même.',
			);
		}
		const community = await this.communityRepository.findOne({
			where: { slug },
		});
		if (!community) throw new NotFoundException('Community not found');
		const user = await this.userRepository.findOne({
			where: { id: userId },
		});
		if (!user) throw new NotFoundException('User not found');

		// Vérifie si déjà invité ou membre
		let learner = await this.learnerRepository.findOne({
			where: { community: { id: community.id }, user: { id: user.id } },
		});

		if (learner) {
			if (learner.status === LearnerStatus.INVITED) {
				throw new BadRequestException(
					'User ' +
						user.firstname +
						' ' +
						user.lastname +
						' is already invited to this community',
				);
			}
			if (learner.status === LearnerStatus.MEMBER) {
				throw new BadRequestException(
					'User ' +
						user.firstname +
						' ' +
						user.lastname +
						' is already a member',
				);
			}
		}

		learner = this.learnerRepository.create({
			community,
			user,
			status: LearnerStatus.INVITED,
			invitedAt: new Date(),
			isContributor: false,
		});
		return this.learnerRepository.save(learner);
	}

	async getInvitedUsersByCommunitySlug(slug: string) {
		const community = await this.communityRepository.findOne({
			where: { slug },
		});
		if (!community) throw new NotFoundException('Community not found');
		return this.learnerRepository.find({
			where: {
				community: { id: community.id },
				status: LearnerStatus.INVITED,
			},
			relations: ['user'],
		});
	}

	async acceptInvitation(slug: string, userId: number) {
		const learner = await this.learnerRepository.findOne({
			where: { community: { slug }, user: { id: userId } },
		});

		if (!learner) throw new NotFoundException('Invitation non trouvée');
		learner.status = LearnerStatus.MEMBER;
		await this.learnerRepository.save(learner);
		return { success: true };
	}

	async declineInvitation(slug: string, userId: number) {
		const learner = await this.learnerRepository.findOne({
			where: { community: { slug }, user: { id: userId } },
		});

		learner.status = LearnerStatus.INVITATION_REJECTED;
		await this.learnerRepository.save(learner);
		return { success: true };
	}
}
