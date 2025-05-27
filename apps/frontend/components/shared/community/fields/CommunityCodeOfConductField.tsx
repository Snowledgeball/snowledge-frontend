import { Label, Textarea } from "@repo/ui";
import { FormError } from "../../../create-community/CreateFormCommu";

export function CommunityCodeOfConductField({ register, error, t }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor="codeOfConduct">{t("codeOfConduct.label")}</Label>
      <Textarea
        id="codeOfConduct"
        placeholder={t("codeOfConduct.placeholder")}
        className="resize-none"
        rows={3}
        {...register("codeOfConduct")}
      />
      <FormError error={error} />
      <p className="text-xs text-muted-foreground">{t("codeOfConduct.help")}</p>
    </div>
  );
}
