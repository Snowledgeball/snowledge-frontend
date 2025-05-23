import { ApiProperty } from '@nestjs/swagger';
import {
	IsDate,
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
} from 'class-validator';
import { Gender } from 'src/shared/enums/Gender';

export class SignUpDto {
	@ApiProperty({ 
		enum: Gender 
	})
	@IsEnum(Gender)
	gender: Gender;

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
		type: Number,
	})
	@IsDate()
	age: Date;

	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	referrer?: string;
}
