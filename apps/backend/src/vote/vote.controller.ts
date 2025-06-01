import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { User } from '../user/decorator';
import { User as UserEntity } from '../user/entities/user.entity';

@Controller('/communities/:communitySlug/votes')
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	@Post(':proposalId')
	create(
		@Param('proposalId') proposalId: number,
		@Body() createVoteDto: CreateVoteDto,
	) {
		return this.voteService.create(proposalId, createVoteDto);
	}

	@Get()
	findAllByUserId(
		@Param('communitySlug') communitySlug: string,
		@User() user: UserEntity,
	) {
		return this.voteService.findAllByUserId(communitySlug, user.id);
	}
}
