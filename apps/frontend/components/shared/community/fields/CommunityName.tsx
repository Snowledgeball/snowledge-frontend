import { Label } from "@repo/ui";
import { FormError } from "@/components/create-community/CreateFormCommu";
import { Input } from "@repo/ui";
import { useTranslations } from "next-intl";

const CommunityName = ({
  register,
  errors,
}: {
  register: any;
  errors: any;
}) => {
  const t = useTranslations("communityForm");
  return (
    <div className="space-y-2">
      <Label htmlFor="name">{t("name.label")}</Label>
      <Input
        id="name"
        placeholder={t("name.placeholder")}
        {...register("name")}
      />
      <FormError error={errors.name?.message} />
    </div>
  );
};

export default CommunityName;
