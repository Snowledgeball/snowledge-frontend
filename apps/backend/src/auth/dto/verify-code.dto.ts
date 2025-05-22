import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber } from 'class-validator';

export class VerifyCodeDto {
	@IsNumber()
	@ApiProperty({ type: Number })
	code: number;

	@ApiProperty({
		type: String,
	})
	@IsEmail()
	email: string;
}
