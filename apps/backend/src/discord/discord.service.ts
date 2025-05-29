import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordAccess } from './entities/discord-access.entity';
import { CreateDiscordAccessDto } from './dto/create-discord-access.dto';

@Injectable()
export class DiscordService {
	constructor(
		@InjectRepository(DiscordAccess)
		private discardAccessRepository: Repository<DiscordAccess>,
	) {}
	async createDiscordAccess(
		createDiscordAccessDto: CreateDiscordAccessDto,
	): Promise<DiscordAccess> {
		const character = await this.discardAccessRepository.create(
			createDiscordAccessDto,
		);
		return this.discardAccessRepository.save(character);
	}
}
