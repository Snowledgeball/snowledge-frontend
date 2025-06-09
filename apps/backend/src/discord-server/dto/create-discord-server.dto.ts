import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDiscordServerDto {
	@IsString()
	discordGuildId: string;

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
	communityId: number;
}
