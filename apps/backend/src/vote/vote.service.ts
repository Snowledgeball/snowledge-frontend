import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote/vote';
import { CreateVoteDto } from './dto/create-vote.dto/create-vote.dto';

@Injectable()
export class VoteService {
	constructor(
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
	) {}

	async findAll(): Promise<Vote[]> {
		return this.voteRepository.find();
	}

	async findOne(id: number): Promise<Vote> {
		const vote = await this.voteRepository.findOneBy({ id });
		if (!vote) throw new NotFoundException('Vote not found');
		return vote;
	}

	async create(createVoteDto: CreateVoteDto): Promise<Vote> {
		const vote = this.voteRepository.create(createVoteDto);
		return this.voteRepository.save(vote);
	}
}
