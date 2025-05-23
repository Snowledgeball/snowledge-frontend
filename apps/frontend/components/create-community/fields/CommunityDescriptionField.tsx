import { Label, Textarea } from "@repo/ui";
import { FormError } from "../CreateFormCommu";

export function CommunityDescriptionField({ register, error, t }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor="description">{t("description.label")}</Label>
      <Textarea
        id="description"
        placeholder={t("description.placeholder")}
        className="resize-none"
        rows={3}
        {...register("description")}
      />
      <FormError error={error} />
    </div>
  );
}
