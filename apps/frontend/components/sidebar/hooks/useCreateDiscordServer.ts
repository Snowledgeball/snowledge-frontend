import { useMutation } from "@tanstack/react-query";
import { DiscordServer } from "@/types/discordServer";
import { useAuth } from "@/contexts/auth-context";

export function useCreateDiscordServer() {
  // Pas utilisé pour l'instant
  const { fetcher } = useAuth();
  return useMutation({
    mutationFn: async (params: Omit<DiscordServer, "id">) => {
      return await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/discord-server`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
