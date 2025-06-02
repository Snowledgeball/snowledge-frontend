import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Label } from "@repo/ui/components/label";

const FormatField = ({ value, onChange, error, t }: any) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor="format">{t("format_label")}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="format" aria-label={t("format_label")}>
        <SelectValue placeholder={t("format_placeholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="masterclass">{t("masterclass")}</SelectItem>
        <SelectItem value="whitepaper">{t("white_paper")}</SelectItem>
      </SelectContent>
    </Select>
    {error && <span className="text-red-500 text-xs">{error.message}</span>}
  </div>
);

export default FormatField;
