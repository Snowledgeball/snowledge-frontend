import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto/create-vote.dto';
import { Vote } from './entities/vote/vote';

@Controller('votes')
export class VoteController {
	constructor(private readonly voteService: VoteService) {}

	// GET /votes
	@Get()
	findAll(): Promise<Vote[]> {
		return this.voteService.findAll();
	}

	// GET /votes/:id
	@Get(':id')
	findOne(@Param('id') id: number): Promise<Vote> {
		return this.voteService.findOne(id);
	}

	// POST /votes
	@Post()
	create(@Body() createVoteDto: CreateVoteDto): Promise<Vote> {
		return this.voteService.create(createVoteDto);
	}
}
