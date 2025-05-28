import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthPayload } from '../shared/interface/IAuthPayload';

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

	createAccessToken(payload: IAuthPayload) {
		return this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' });
	}
	async createRefreshToken(payload: IAuthPayload) {
		return this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });
	}
	createEmailVerificationToken(payload: { userId: number; email: string }) {
		return this.jwtService.sign(payload, {
			secret: process.env.JWT_EMAIL_SECRET,
			expiresIn: '1h', // ou 24h selon ton besoin
		});
	}
	async validateUser(payload: any): Promise<any> {
		// Validate the user exists in your database, etc.
		return { id: payload.id };
	}

}
