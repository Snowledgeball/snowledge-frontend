import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Email } from './entities/email.entity';
import { CreateCodeEmailDto } from './dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { EmailType } from 'src/shared/enums/EmailType';

@Injectable()
export class EmailService {
	constructor(
		@InjectRepository(Email)
		private emailRepository: Repository<Email>,
	) {}
	async createCode(createCodeDto: CreateCodeEmailDto): Promise<Email> {
		const character = await this.emailRepository.create(createCodeDto);
		return this.emailRepository.save(character);
	}
	findCreatedLessThan(email: string, emailType: EmailType, date: Date) {
		return this.emailRepository.find({
			where: {
				email,
				emailType,
				created_at: LessThan(date),
			},
		});
	}
	findByEmail(email: string) {
		return this.emailRepository.findOne({
			where: { email },
		});
	}
	findOneByCodeEmail(code: number, email: string) {
		return this.emailRepository.findOne({
			where: { code, email },
		});
	}
	//   create(createEmailDto: CreateEmailDto) {
	//     return 'This action adds a new email';
	//   }
	//   findAll() {
	//     return `This action returns all email`;
	//   }
	//   findOne(id: number) {
	//     return `This action returns a #${id} email`;
	//   }
	async update(id: number, updateEmailDto: UpdateEmailDto): Promise<Email> {
		await this.emailRepository.update({ id }, updateEmailDto);
		return this.emailRepository.findOne({
			where: { id },
		});
	}
	//   remove(id: number) {
	//     return `This action removes a #${id} email`;
	//   }
}
