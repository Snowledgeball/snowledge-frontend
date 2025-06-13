import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

export function useCreateChannels() {
  const { fetcher } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      guildId: string;
      proposeName?: string;
      voteName?: string;
      resultName?: string;
    }) => {
      return await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/discord-bot/create-channels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
