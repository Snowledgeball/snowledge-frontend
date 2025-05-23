import {
	Body,
	Controller,
	Post,
	HttpCode,
	HttpStatus,
	Get,
	Param,
	Logger,
	Req,
	UnauthorizedException,
	Res,
} from '@nestjs/common';
import { AuthProvider } from './auth.provider';
import { Public } from './auth.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SignInDto, SignUpDto, VerifyCodeDto } from './dto';
import { EmailProvider } from 'src/email/email.provider';
import { Response, Request } from 'express';
import { VerifyTokenDto } from './dto/verify-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);
	constructor(
		private authProvider: AuthProvider,
		private readonly emailProvider: EmailProvider,
	) {}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('sign-in')
	@ApiBody({ type: SignInDto })
	async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
		const { access_token, refresh_token, auth } = await this.authProvider.signIn(signInDto.email, signInDto.password);
		res.cookie('refresh-token', refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
		});
		return { access_token, auth }
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('sign-up')
	@ApiBody({ type: SignUpDto })
	async signUp(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) res: Response) {
		// return this.authProvider.signUp(signUpDto);
		const { access_token, refresh_token, auth } = await this.authProvider.signUp(signUpDto);
		res.cookie('refresh-token', refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
		});
		return { access_token, auth }
	}
	
	@Public()
	@Post('refresh-token')
	refreshToken(@Req() req: Request) {
		const refreshToken = req.cookies?.['refresh-token'];
		if (!refreshToken) {
			throw new UnauthorizedException('No refresh token provided');
		}
		return this.authProvider.refreshToken(refreshToken);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('verify-code')
	postVerifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
		return this.emailProvider.findCode(verifyCodeDto.code, verifyCodeDto.email);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('verify-token')
	postVerifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
		return this.authProvider.verifyTokenEmail(verifyTokenDto.token);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Get('check-email/:email')
	async checkEmail(@Param('email') email: string) {
		try {
			const userByEmail = await this.authProvider.checkEmail(email);
			if (typeof userByEmail === 'boolean') {
				return { is_authorized: true, status: 0 };
			}
			if (!userByEmail.used) {
				return { is_authorized: false, status: 1 };
			}
			await this.emailProvider.passwordLess(email);
			return { is_authorized: false, status: 2 };
		} catch (error) {
			this.logger.error(error);
			return { is_authorized: false, status: 3 };
		}
	}
}
