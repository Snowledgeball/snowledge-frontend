import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; // ou le toast que tu utilises
import { FormSchema } from "./use-community-form-schema";
import { useTranslations } from "next-intl";

export function useCreateCommunity({
  onSuccess,
}: {
  onSuccess?: (data: any, variables: any) => void;
} = {}) {
  const t = useTranslations("createCommunityForm");
  return useMutation({
    mutationFn: async (data: FormSchema) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token-123", // TODO: get token
          },
          body: JSON.stringify({
            ...data,
            user: 2, // TODO: get user id
          }),
        }
      );
      if (!res.ok) {
        let err;
        try {
          err = await res.json();
        } catch {
          err = { message: "Erreur inconnue" };
        }
        throw new Error(err.message || "Erreur lors de la création");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(t("toast.success"));
      onSuccess?.(data, variables);
    },
  });
}
