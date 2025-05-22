import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthPayload } from '../shared/interface/IAuthPayload';

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

	async createAccessToken(payload: IAuthPayload) {
		return this.jwtService.sign(payload, { expiresIn: '15m' });
	}

	async validateUser(payload: any): Promise<any> {
		// Validate the user exists in your database, etc.
		return { id: payload.id };
	}

}
