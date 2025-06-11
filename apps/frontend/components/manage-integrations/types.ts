export interface Channel {
  id: string;
  name: string;
}

export interface ChannelNames {
  propose: string;
  vote: string;
  result: string;
}

export interface DiscordServer {
  id: number;
  discordGuildId: string;
  proposeChannelId?: string;
  voteChannelId?: string;
  resultChannelId?: string;
  communityId: number;
}

export interface KindOfMissing {
  all?: boolean;
  channelName?: {
    propose?: boolean;
    vote?: boolean;
    result?: boolean;
  };
}
