import { Label, Textarea } from "@repo/ui";
import { FormError } from "../../../create-community/CreateFormCommu";
import { useTranslations } from "next-intl";

export function CommunityDescriptionField({ register, error }: any) {
  const t = useTranslations("communityForm");

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
