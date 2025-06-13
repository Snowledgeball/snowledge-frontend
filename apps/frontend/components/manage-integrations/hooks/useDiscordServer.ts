import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { DiscordServer } from "@/types/discordServer";

export function useDiscordServer(communityId: number) {
  const { fetcher } = useAuth();
  return useQuery<DiscordServer>({
    queryKey: ["discord-server", communityId],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/discord-server/by-community/${communityId}`
      );
      // On suppose qu'il n'y a qu'un mapping par communauté (sinon, prendre le premier)
      return Array.isArray(res) ? res[0] : res;
    },
    enabled: !!communityId,
  });
}
