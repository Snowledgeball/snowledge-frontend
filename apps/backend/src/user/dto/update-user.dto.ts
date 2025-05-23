import { ApiProperty, OmitType } from '@nestjs/swagger';
import { SignUpDto } from '../../auth/dto';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from 'src/shared/enums/Gender';

export class UpdateUserDto {
	@ApiProperty({ 
		enum: Gender 
	})
	@IsEnum(Gender)
	gender?: Gender;

	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	firstname?: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	lastname?: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	pseudo?: string;

	@ApiProperty({
		type: String,
	})
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	password?: string;

	@ApiProperty({
		type: Number,
	})
	@IsDate()
	@IsOptional()
	age?: Date;
	
	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	refreshToken?: string;

	@ApiProperty({
		type: Boolean,
	})
	@IsDate()
	@IsOptional()
	isActive?: boolean;
}
