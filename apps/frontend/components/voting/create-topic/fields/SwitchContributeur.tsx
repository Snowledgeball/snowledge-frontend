import React from "react";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";

const SwitchContributeur = ({ value, onChange, t }: any) => (
  <div className="flex items-center gap-3">
    <Switch
      id="contributor"
      checked={value}
      onCheckedChange={onChange}
      aria-label={t("i_want_to_be_contributor")}
    />
    <Label htmlFor="contributor" className="cursor-pointer select-none">
      {t("i_want_to_be_contributor")}
    </Label>
  </div>
);

export default SwitchContributeur;
