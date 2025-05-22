import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { EmailService } from '../email/email.service';
import { AuthService } from './auth.service';
// import { hexToBytes } from 'viem/utils';

@Injectable()
export class AuthProvider {
	private readonly logger = new Logger(AuthProvider.name);

	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly emailService: EmailService,
	) {}

	async signUp(
		signUpDto: SignUpDto,
	): Promise<{ access_token: string; auth: string }> {
		const { firstname, lastname, pseudo, email, password } = signUpDto;
		const hashPassword = await bcrypt.hash(password, 10);

		const user = await this.userService.create({
			firstname,
			lastname,
			pseudo,
			email,
			password: hashPassword,
		});

		const payload = { userId: user.id, firstname: user.firstname, lastname: user.lastname };

		return {
			access_token: await this.authService.createAccessToken(payload),
			auth: 'create',
		};
	}
	async signIn(
		email: string,
		pass: string,
	): Promise<{ access_token: string; auth: string }> {
		const user = await this.userService.findOneByEmail(email);
		// console.log(user);
		if (!user) {
			throw new UnauthorizedException('Invalid user information');
		}
		const passwordMatch = await bcrypt.compare(pass, user.password);
		if (!passwordMatch) {
			throw new UnauthorizedException('Invalid information user');
		}
		const payload = { userId: user.id, firstname: user.firstname, lastname: user.lastname };

		return {
			access_token: await this.authService.createAccessToken(payload),
			auth: 'log',
		};
	}


	async checkEmail(email: string) {
		const user = await this.userService.findOneByEmail(email);
		if (!user) throw new Error('User not found');

		const emailFind = await this.emailService.findByEmail(email);
		if (!emailFind) return true;

		const now = new Date();
		const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000); // Soustrait 15 minutes au temps actuel

		if (emailFind.used && emailFind.updated_at >= fifteenMinutesAgo) {
			return true;
		} else {
			return emailFind;
		}
	}
}
