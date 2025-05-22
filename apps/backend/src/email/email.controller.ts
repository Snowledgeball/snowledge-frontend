import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailProvider } from './email.provider';
import { Public } from '../auth/auth.decorator';

@ApiTags('Email')
@Controller('email')
export class EmailController {
	constructor(private readonly emailProvider: EmailProvider) {}


	@Public()
	@HttpCode(HttpStatus.OK)
	@Get(':email')
	findOne(@Param('email') email: string) {
		return this.emailProvider.passwordLess(email);
	}

}
