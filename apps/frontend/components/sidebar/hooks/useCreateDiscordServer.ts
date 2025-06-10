import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { DiscordServer } from "../../manage-integrations/types";

export function useCreateDiscordServer() {
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
