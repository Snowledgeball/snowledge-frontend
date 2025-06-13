import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { DiscordServer } from "@/types/discordServer";

export function useUpdateDiscordServer() {
  const { fetcher } = useAuth();
  return useMutation({
    mutationFn: async (
      params: { guildId: string } & Partial<DiscordServer>
    ) => {
      console.log("params", params);
      return await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/discord-server/${params.guildId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
