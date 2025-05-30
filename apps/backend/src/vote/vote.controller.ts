import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto/create-vote.dto';
import { Vote } from './entities/vote/vote.entity';

@Controller('communities/:communitySlug/votes')
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	// GET /votes
	@Get()
	findAll(@Param('communitySlug') communitySlug: string): Promise<Vote[]> {
		return this.voteService.findAllForACommunityBySlug(communitySlug);
	}

	// GET /votes/:id
	@Get(':id')
	findOne(
		@Param('communitySlug') communitySlug: string,
		@Param('id') id: number,
	): Promise<Vote> {
		return this.voteService.findOne(id, communitySlug);
	}

	// POST /votes
	@Post()
	create(
		@Param('communitySlug') communitySlug: string,
		@Body() createVoteDto: CreateVoteDto,
	): Promise<Vote> {
		return this.voteService.create(createVoteDto, communitySlug);
	}
}
