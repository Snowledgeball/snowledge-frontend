import React from "react";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";

const CommentsField = ({ register, error, t }: any) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor="comments">{t("comments_label")}</Label>
    <Textarea
      id="comments"
      {...register("comments")}
      placeholder={t("comments_placeholder")}
      aria-label={t("comments_label")}
      tabIndex={0}
      maxLength={400}
      className="min-h-[80px]"
    />
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

export default CommentsField;
