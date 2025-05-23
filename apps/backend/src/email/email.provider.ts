import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailHelper } from './email.helper';
import { EmailType } from 'src/shared/enums/EmailType';
import { generateEightDigit } from 'src/shared/utils/generateEightDigit';

@Injectable()
export class EmailProvider {
	constructor(
		private readonly emailHelper: EmailHelper,
		private readonly emailService: EmailService,
	) {}
	async findCode(code: number, email: string) {
		const emailFind = await this.emailService.findOneByCodeEmail(code, email);
		if (!emailFind.used) {
			await this.emailService.update(emailFind.id, { used: true });
			return true;
		} else {
			const now = new Date();
			const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
			if (emailFind.used && emailFind.updated_at >= fifteenMinutesAgo) {
				return true;
			}
			const pastDay = new Date().getTime() - 1 * 24 * 60 * 60 * 1000;
			const codeCreate = await this.emailService.findCreatedLessThan(
				email,
				EmailType.Code,
				new Date(pastDay),
			);
			const codeNotUsed = codeCreate.filter(
				(email) => email.used || !email.used,
			);
			if (codeNotUsed.length > 4) return true;
		}
		return false;
	}
	async passwordLess(email: string) {
		const pastDay = new Date().getTime() - 1 * 24 * 60 * 60 * 1000;
		const codeCreate = await this.emailService.findCreatedLessThan(
			email,
			EmailType.Code,
			new Date(pastDay),
		);
		const codeNotUsed = codeCreate.filter((email) => !email.used);
		if (codeNotUsed.length > 4) throw new Error(`Max code generate today`);
		// const { email, name } = data;
		const numberCode = generateEightDigit();

		await this.emailService.createCode({
			code: numberCode,
			email,
		});

		await this.emailHelper.codeEmail(email, numberCode);
	}
}
