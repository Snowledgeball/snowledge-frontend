import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { ChannelNames } from "@/types/channelNames";

export function useRenameChannels() {
  const { fetcher } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      guildId: string;
      oldNames: ChannelNames;
      newNames: ChannelNames;
    }) => {
      return await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/discord-bot/rename-channels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
