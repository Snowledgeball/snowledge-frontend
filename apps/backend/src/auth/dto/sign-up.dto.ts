import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmail,
	IsOptional,
	IsString,
} from 'class-validator';

export class SignUpDto {
	@ApiProperty({
		type: String,
	})
	@IsString()
	firstname: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	lastname: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	pseudo: string;

	@ApiProperty({
		type: String,
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	password: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	referrer?: string;
}
