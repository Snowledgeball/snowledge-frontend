import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDiscordServerDto {
	@IsString()
	guildId: string;

	@IsString()
	guildName: string;

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
