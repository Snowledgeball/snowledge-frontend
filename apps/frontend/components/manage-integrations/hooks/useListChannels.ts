import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

export function useListChannels(guildId: string) {
  return useQuery({
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
