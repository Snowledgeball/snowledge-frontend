// Utilitaires pour la gestion des channels Discord
import { Channel } from "@/types/channel";

export function getChannelName(channels: Channel[] = [], id?: string): string {
  return channels.find((ch) => ch.id === id)?.name || "";
}

export function getMissingChannels(
  channels: Channel[] = [],
  ids: { propose?: string; vote?: string; result?: string }
) {
  return {
    propose: !getChannelName(channels, ids.propose),
    vote: !getChannelName(channels, ids.vote),
    result: !getChannelName(channels, ids.result),
  };
}

export function getChannelIdByName(
  channels: Channel[] = [],
  name: string
): string | undefined {
  return channels.find((ch) => ch.name === name)?.id;
}

export function getExistingChannelNames(
  channels: Channel[] = [],
  ids: { propose?: string; vote?: string; result?: string }
): { propose: string; vote: string; result: string } {
  return {
    propose: getChannelName(channels, ids.propose) || "propositions",
    vote: getChannelName(channels, ids.vote) || "votes",
    result: getChannelName(channels, ids.result) || "résultats",
  };
}
