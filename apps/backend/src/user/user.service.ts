import { Injectable, NotFoundException } from '@nestjs/common';
// This should be a real class/interface representing a user entity
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto';
import { randomUUID } from 'node:crypto';
import { SignUpDto } from 'src/auth/dto';
import { ILike } from 'typeorm';
import { Learner, LearnerStatus } from 'src/learner/entities/learner/learner';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Learner)
		private learnerRepository: Repository<Learner>,
	) {}
	async create(signUpDto: SignUpDto): Promise<User> {
		const user = await this.userRepository.create(signUpDto);
		return this.userRepository.save(user);
	}
	async findAll(search?: string) {
		if (search) {
			return this.userRepository.find({
				where: [
					{ firstname: ILike(`%${search}%`) },
					{ lastname: ILike(`%${search}%`) },
					{ pseudo: ILike(`%${search}%`) },
					{ email: ILike(`%${search}%`) },
				],
				take: 20, // limite le nombre de résultats
			});
		}
		return this.userRepository.find();
	}

	findOneById(id: number): Promise<User | null> {
		return this.userRepository.findOne({
			where: { id },
			relations: ['discordAccess'],
		});
	}
	findOneByEmail(email: string): Promise<User | null> {
		return this.userRepository.findOne({
			where: { email },
			relations: ['discordAccess'],
		});
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		return this.userRepository.update(id, updateUserDto);
	}

	async updateValueNewColumn() {
		const users = await this.userRepository.find();
		for (const user of users) {
			await this.userRepository.update(user.id, {
				referral: randomUUID().replace(/-g/, '').slice(0, 8),
			});
		}
	}
	deleteByEmail(email: string) {
		return this.userRepository.delete({ email });
	}

	async getInvitationsForUser(userId: number) {
		const user = await this.userRepository.findOne({
			where: { id: userId, learners: { status: LearnerStatus.INVITED } },
			relations: ['learners', 'learners.community'],
		});
		if (!user) {
			return [];
		}
		return user.learners.map((learner) => learner.community);
	}
}
