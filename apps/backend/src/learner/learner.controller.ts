import {
	Controller,
	Post,
	Param,
	Body,
	Get,
	Delete,
	NotFoundException,
	Patch,
} from '@nestjs/common';
import { LearnerService } from './learner.service';
import { User as UserEntity } from '../user/entities/user.entity';
import { User as UserDecorator } from '../user/decorator';

@Controller('communities/:slug/learners')
export class LearnerController {
	constructor(private readonly learnerService: LearnerService) {}

	// Ajouter un user à une communauté
	@Post('invite')
	async inviteUser(
		@Param('slug') slug: string,
		@Body('userId') userId: number,
		@UserDecorator() user: UserEntity,
	) {
		return this.learnerService.inviteUserToCommunity(slug, userId, user.id);
	}

	// Afficher tous les learners d'une communauté
	@Get()
	async getLearners(@Param('slug') slug: string) {
		return this.learnerService.getLearnersByCommunitySlug(slug);
	}

	@Get('invited')
	async getInvitedUsers(@Param('slug') slug: string) {
		return this.learnerService.getInvitedUsersByCommunitySlug(slug);
	}

	@Post('accept-invitation')
	async acceptInvitation(
		@Param('slug') slug: string,
		@UserDecorator() user: UserEntity,
	) {
		return this.learnerService.acceptInvitation(slug, user.id);
	}

	@Post('decline-invitation')
	async declineInvitation(
		@Param('slug') slug: string,
		@UserDecorator() user: UserEntity,
	) {
		return this.learnerService.declineInvitation(slug, user.id);
	}

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
	// Supprimer un learner d'une communauté
	@Delete(':userId')
	async removeLearner(
		@Param('slug') slug: string,
		@Param('userId') userId: number,
	) {
		return this.learnerService.removeLearnerFromCommunity(slug, userId);
	}

	// PATCH pour promouvoir/rétrograder un learner
	@Patch(':userId')
	async updateLearner(
		@Param('slug') slug: string,
		@Param('userId') userId: number,
		@Body('isContributor') isContributor: boolean,
	) {
		return this.learnerService.updateLearnerContributor(
			slug,
			userId,
			isContributor,
		);
	}
}
