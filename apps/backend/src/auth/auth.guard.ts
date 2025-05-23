import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY, jwtConstants } from './constants';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
		private readonly userService: UserService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			// 💡 See this condition
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = this.extractToken(request);

		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_ACCESS_SECRET,
			});
			// 💡 We're assigning the payload to the request object here
			// so that we can access it in our route handlers
			if (!request['user']) {
				request['user'] = await this.userService.findOneById(payload.userId);
			}
		} catch (error) {
			// console.log('error', error);
			throw new UnauthorizedException();
		}
		// console.log('before return auth');
		return true;
	}

	private extractToken(request: Request): string | undefined {
		const [type, tokenFromHeader] = request.headers.authorization?.split(' ') ?? [];
		if (type === 'Bearer' && tokenFromHeader) return tokenFromHeader;

    	return request.cookies?.['access-token'];
	}
}
