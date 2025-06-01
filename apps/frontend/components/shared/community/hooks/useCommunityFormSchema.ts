import { z } from "zod";
import { useTranslations } from "next-intl";

export function useCommunityFormSchema() {
  const t = useTranslations("communityForm.errors");

  return z
    .object({
      name: z
        .string()
        .min(2, { message: t("name.min") })
        .refine((val) => !/[()]/.test(val), {
          message: t("name.noParentheses"),
        }),
      tags: z.array(z.string()).min(1, { message: t("tags.min") }),
      communityType: z.enum(["free", "paid"], {
        required_error: t("communityType.required"),
      }),
      price: z.any(),
      yourPercentage: z.any(),
      communityPercentage: z.any(),
      description: z.string().min(1, { message: t("description.min") }),
      codeOfConduct: z.string().min(1, { message: t("codeOfConduct.min") }),
    })
    .superRefine((data, ctx) => {
      if (data.communityType === "paid") {
        const valPrice = Number(data.price);
        if (!data.price || isNaN(valPrice) || valPrice <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["price"],
            message: t("price.positive"),
          });
        }
        const val = Number(data.yourPercentage);
        if (!data.yourPercentage || isNaN(val) || val <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["yourPercentage"],
            message: t("yourPercentage.required"),
          });
        }
        const valCommunity = Number(data.communityPercentage);
        if (
          !data.communityPercentage ||
          isNaN(valCommunity) ||
          valCommunity <= 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["communityPercentage"],
            message: t("communityPercentage.required"),
          });
        }
        if (
          typeof data.yourPercentage === "number" &&
          typeof data.communityPercentage === "number" &&
          !isNaN(data.yourPercentage) &&
          !isNaN(data.communityPercentage)
        ) {
          const snowledgePercentage = 15;
          const total =
            data.yourPercentage +
            data.communityPercentage +
            snowledgePercentage;
          if (total !== 100) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["repartition"],
              message: t("repartition.total"),
            });
          }
        }
      }
    });
}

export type FormSchema = z.infer<ReturnType<typeof useCommunityFormSchema>>;
