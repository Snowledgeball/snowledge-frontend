import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { ChannelNames } from "../management-integration";

export function useRenameChannels() {
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
