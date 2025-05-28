import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber } from 'class-validator';

export class VerifyTokenDto {
	@IsNumber()
	@ApiProperty({ 
		type: String 
	})
	token: string;
}
