import { z } from "zod";

export const voteSchema = z.object({
  proposalId: z.number(),
  userId: z.number(),
  choice: z.enum(["for", "against"], {
    required_error: "vote.errors.choice_required",
  }),
  comment: z.string().max(400, "vote.errors.comment_too_long").optional(),
  formatChoice: z.enum(["for", "against"]).optional(),
  formatComment: z
    .string()
    .max(400, "vote.errors.format_comment_too_long")
    .optional(),
});

export type VoteFormValues = z.infer<typeof voteSchema>;
