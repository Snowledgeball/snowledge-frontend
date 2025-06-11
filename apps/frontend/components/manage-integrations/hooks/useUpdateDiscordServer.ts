import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { DiscordServer } from "../types";

export function useUpdateDiscordServer() {
  return useMutation({
    mutationFn: async (params: { id: number } & Partial<DiscordServer>) => {
      console.log("params", params);
      return await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/discord-server/${params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
