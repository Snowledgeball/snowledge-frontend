import { Body, Controller, Param, Post } from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('proposal/:proposalId/vote')
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	@Post()
	create(
		@Param('proposalId') proposalId: number,
		@Body() createVoteDto: CreateVoteDto,
	) {
		return this.voteService.create(proposalId, createVoteDto);
	}
}
