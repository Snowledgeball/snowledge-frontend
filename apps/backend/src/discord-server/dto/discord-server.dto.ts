import { DiscordServer } from '../entities/discord-server-entity';

export class DiscordServerDto {
	guildId: string;
	guildName: string;
	proposeChannelId?: string;
	voteChannelId?: string;
	resultChannelId?: string;
	communityId: number;

	constructor(entity: DiscordServer) {
		this.guildId = entity.guildId;
		this.guildName = entity.guildName;
		this.proposeChannelId = entity.proposeChannelId;
		this.voteChannelId = entity.voteChannelId;
		this.resultChannelId = entity.resultChannelId;
		this.communityId = entity.community?.id;
	}
}
