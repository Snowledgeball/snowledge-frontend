import React from "react";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";

const TitleField = ({ register, error, t }: any) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor="title">
      {t("title_label")} <span className="text-red-500">*</span>
    </Label>
    <Input
      id="title"
      {...register("title")}
      placeholder={t("title_placeholder")}
      aria-required="true"
      aria-label={t("vote_title")}
      tabIndex={0}
      maxLength={80}
    />
    <span className="text-xs text-muted-foreground">
      {t("max_80_characters")}
    </span>
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

export default TitleField;
