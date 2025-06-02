import { z } from "zod";

export const voteSchema = (t: any) =>
  z.object({
    title: z
      .string({
        required_error: t("errors.title_required"),
      })
      .min(5, { message: t("errors.title_too_short") })
      .max(80, { message: t("errors.title_too_long") }),
    description: z
      .string({
        required_error: t("errors.description_required"),
      })
      .min(10, { message: t("errors.description_too_short") })
      .max(200, { message: t("errors.description_too_long") }),
    format: z
      .string()
      .min(2, { message: t("errors.format_too_short") })
      .max(40, { message: t("errors.format_too_long") })
      .optional(),
    comments: z
      .string()
      .max(400, { message: t("errors.comments_too_long") })
      .optional(),
    isContributor: z.boolean().optional(),
  });

export type VoteFormValues = z.infer<ReturnType<typeof voteSchema>>;
