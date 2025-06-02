import React from "react";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";

const DescriptionField = ({ register, error, t }: any) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor="description">
      {t("description_label")} <span className="text-red-500">*</span>
    </Label>
    <Textarea
      id="description"
      {...register("description")}
      placeholder={t("description_placeholder")}
      aria-required="true"
      aria-label={t("vote_description")}
      tabIndex={0}
      maxLength={200}
      className="min-h-[60px]"
    />
    <span className="text-xs text-muted-foreground">
      {t("max_200_characters")}
    </span>
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

export default DescriptionField;
