export type DiscordServer = {
  id: number;
  guildId: string;
  proposeChannelId?: string;
  voteChannelId?: string;
  resultChannelId?: string;
  communityId: number;
};
