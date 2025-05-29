import {
	Controller,
	Post,
	Param,
	Body,
	Get,
	Delete,
	NotFoundException,
} from '@nestjs/common';
import { LearnerService } from './learner.service';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

@Controller('communities/:slug/learners')
export class LearnerController {
	constructor(private readonly learnerService: LearnerService) {}

	// Ajouter un user à une communauté
	@Post(':userId')
	async addLearner(
		@Param('slug') slug: string,
		@Param('userId') userId: number,
		@Body('isContributor') isContributor: boolean = false,
	) {
		return this.learnerService.addLearnerToCommunity(
			slug,
			userId,
			isContributor,
		);
	}

	// Afficher tous les learners d'une communauté
	@Get()
	async getLearners(@Param('slug') slug: string) {
		return this.learnerService.getLearnersByCommunitySlug(slug);
	}

	// Supprimer un learner d'une communauté
	@Delete(':userId')
	async removeLearner(
		@Param('slug') slug: string,
		@Param('userId') userId: number,
	) {
		return this.learnerService.removeLearnerFromCommunity(slug, userId);
	}
}
