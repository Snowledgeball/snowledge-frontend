import { DiscordServer } from '../entities/discord-server-entity';

export class DiscordServerDto {
	id: number;
	discordGuildId: string;
	proposeChannelId?: string;
	voteChannelId?: string;
	resultChannelId?: string;
	communityId: number;

	constructor(entity: DiscordServer) {
		this.id = entity.id;
		this.discordGuildId = entity.discordGuildId;
		this.proposeChannelId = entity.proposeChannelId;
		this.voteChannelId = entity.voteChannelId;
		this.resultChannelId = entity.resultChannelId;
		this.communityId = entity.community?.id;
	}
}
