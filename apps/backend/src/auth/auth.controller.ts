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
	Delete,
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
			domain: process.env.COOKIE_DOMAIN || undefined,
		});

		res.cookie('access-token', access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 15 * 60 * 1000, // 15 minutes
			domain: process.env.COOKIE_DOMAIN || undefined,
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
			domain: process.env.COOKIE_DOMAIN || undefined,
		});

		res.cookie('access-token', access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 15 * 60 * 1000, // 15 minutes
			domain: process.env.COOKIE_DOMAIN || undefined,
		});

		return { access_token, auth }
	}
	
	@Public()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete('session')
	async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const refreshToken = req.cookies?.['refresh-token'];
		const accessToken = req.cookies?.['access-token'];
		console.log('refreshToken', refreshToken)
		if (!refreshToken && !accessToken) {
			return { success: true };
		}

		await this.authProvider.signOut(refreshToken);
		// Delete the client-side cookie
		res.clearCookie('refresh-token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			domain: process.env.COOKIE_DOMAIN || undefined,
		});
		res.clearCookie('access-token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			domain: process.env.COOKIE_DOMAIN || undefined,
		});
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('refresh-token')
	refreshToken(@Req() req: Request, @Body('refreshToken') refreshToken: string) {
		if (req.headers['x-internal-call'] !== 'true') {
			throw new UnauthorizedException('Blocked');
		}

		if (!refreshToken && !req.cookies?.['refresh-token']) {
			throw new UnauthorizedException('No refresh token provided');
		}
		const token = refreshToken ?? req.cookies?.['refresh-token'];
		return this.authProvider.refreshToken(token);
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

}
