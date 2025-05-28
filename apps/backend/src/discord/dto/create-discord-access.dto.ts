import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateDiscordAccessDto {
	@ApiProperty({
		type: String,
	})
	@IsString()
	accessToken: string;
	
	@ApiProperty({
		type: String,
	})
	@IsString()
	tokenType: string;
	
	@ApiProperty({ type: Number })
	@IsNumber()
	expiresIn: number;
	
	@ApiProperty({
		type: String,
	})
	@IsString()
	refreshToken: string;
	
	@ApiProperty({
		type: String,
	})
	@IsString()
	scope: string;
}
