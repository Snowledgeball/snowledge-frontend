import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; // ou le toast que tu utilises
import { FormSchema } from "../../shared/community/hooks/use-community-form-schema";
import { useTranslations } from "next-intl";

export function useUpdateCommunity(
  id: number,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const t = useTranslations("communityForm.toast");

  return useMutation({
    mutationFn: async (data: FormSchema) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token-123", // TODO: get token
          },
          body: JSON.stringify({
            ...data,
          }),
        }
      );
      if (!res.ok) {
        let err;
        try {
          err = await res.json();
        } catch {
          err = { message: t("unknownError") };
        }
        throw new Error(err.message || t("unknownError"));
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(t("success"));
      onSuccess?.(data, variables);
    },
    onError: (error: any) => {
      if (error.message.includes("already exists")) {
        toast.error(t("alreadyExists"));
      } else {
        toast.error(error.message);
      }
      onError?.(error);
    },
  });
}
