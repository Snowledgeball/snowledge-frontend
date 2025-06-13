import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Channel } from "@/types/channel";

export function useListChannels(guildId: string) {
  const { fetcher } = useAuth();
  return useQuery<Channel[]>({
    queryKey: ["discord-channels", guildId],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/discord-bot/list-channels?guildId=${encodeURIComponent(guildId)}`
      );
      return res;
    },
    enabled: !!guildId,
  });
}
