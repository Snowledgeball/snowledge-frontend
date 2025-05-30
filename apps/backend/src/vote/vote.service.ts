import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VoteService {
	constructor(
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
	) {}

	async create(proposalId: number, createVoteDto: CreateVoteDto) {
		const vote = this.voteRepository.create({
			...createVoteDto,
			proposal: { id: proposalId },
			user: { id: createVoteDto.userId },
		});
		return this.voteRepository.save(vote);
	}
}
