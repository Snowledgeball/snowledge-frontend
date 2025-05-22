import {
	Body,
	Controller,
	Post,
	HttpCode,
	HttpStatus,
	Get,
	Param,
	Logger,
} from '@nestjs/common';
import { AuthProvider } from './auth.provider';
import { Public } from './auth.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SignInDto, SignUpDto, VerifyCodeDto } from './dto';
import { EmailProvider } from 'src/email/email.provider';

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
	signIn(@Body() signInDto: SignInDto) {
		return this.authProvider.signIn(signInDto.email, signInDto.password);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('sign-up')
	@ApiBody({ type: SignUpDto })
	signUp(@Body() signUpDto: SignUpDto) {
		return this.authProvider.signUp(signUpDto);
	}
	

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('verify-code')
	postVerifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
		return this.emailProvider.findCode(verifyCodeDto.code, verifyCodeDto.email);
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
