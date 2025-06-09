import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordServer } from './entities/discord-server-entity';
import { CreateDiscordServerDto } from './dto/create-discord-server.dto';
import { UpdateDiscordServerDto } from './dto/update-discord-server.dto';
import { Community } from '../community/entities/community.entity';

@Injectable()
export class DiscordServerService {
	constructor(
		@InjectRepository(DiscordServer)
		private discordServerRepository: Repository<DiscordServer>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
	) {}

	async create(data: CreateDiscordServerDto) {
		const community = await this.communityRepository.findOne({
			where: { id: data.communityId },
		});
		const entity = this.discordServerRepository.create({
			...data,
			community,
		});
		return this.discordServerRepository.save(entity);
	}

	findAll() {
		return this.discordServerRepository.find({ relations: ['community'] });
	}

	findOne(id: number) {
		return this.discordServerRepository.findOne({
			where: { id },
			relations: ['community'],
		});
	}

	async update(id: number, data: UpdateDiscordServerDto) {
		if (data.communityId) {
			const community = await this.communityRepository.findOne({
				where: { id: data.communityId },
			});
			await this.discordServerRepository.update(id, {
				...data,
				community,
			});
		} else {
			await this.discordServerRepository.update(id, data);
		}
		return this.findOne(id);
	}

	remove(id: number) {
		return this.discordServerRepository.delete(id);
	}
}
