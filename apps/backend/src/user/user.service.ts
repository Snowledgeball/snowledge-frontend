import { Injectable } from '@nestjs/common';
// This should be a real class/interface representing a user entity
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto';
import { randomUUID } from 'node:crypto';
import { SignUpDto } from 'src/auth/dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}
	async create(signUpDto: SignUpDto): Promise<User> {
		const user = await this.userRepository.create(signUpDto);
		return this.userRepository.save(user);
	}
	findAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	findOneById(id: number): Promise<User | null> {
		return this.userRepository.findOne({
			where: { id },
		});
	}
	findOneByEmail(email: string): Promise<User | null> {
		return this.userRepository.findOne({
			where: { email },
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
}
