import { ApiProperty, getSchemaPath, OmitType } from '@nestjs/swagger';
import { SignUpDto } from '../../auth/dto';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Gender } from 'src/shared/enums/Gender';
import { DiscordAccess } from 'src/discord/entities/discord-access.entity';

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

	@IsString()
	@ApiProperty({ type: String })
	@IsOptional()
	discordId?: string;

	@IsString()
	@ApiProperty({ type: String })
	@IsOptional()
	youtubeId?: string;

	@ValidateNested()
	@IsOptional()
	@ApiProperty({
		type: 'object',
		additionalProperties: { $ref: getSchemaPath(DiscordAccess) },
	})
	discordAccess?: DiscordAccess;
}
