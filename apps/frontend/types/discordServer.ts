export type DiscordServer = {
  id: number;
  discordGuildId: string;
  proposeChannelId?: string;
  voteChannelId?: string;
  resultChannelId?: string;
  communityId: number;
};
