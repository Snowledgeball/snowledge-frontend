import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateDiscordServerDto {
	@IsString()
	@IsOptional()
	discordGuildId?: string;

	@IsString()
	@IsOptional()
	proposeChannelId?: string;

	@IsString()
	@IsOptional()
	voteChannelId?: string;

	@IsString()
	@IsOptional()
	resultChannelId?: string;

	@IsNumber()
	@IsOptional()
	communityId?: number;
}
