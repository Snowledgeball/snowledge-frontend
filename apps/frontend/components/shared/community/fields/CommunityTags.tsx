import { FormError } from "@/components/create-community/CreateFormCommu";
import React from "react";
import { MultiSelect } from "../ui/MultiSelect";
import { Label } from "@repo/ui";
import { useTranslations } from "next-intl";

const CommunityTags = ({
  register,
  errors,
  setValue,
  watch,
}: {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
}) => {
  const t = useTranslations("communityForm");
  const communityTags = [
    { label: "Tech", value: "technology" },
    { label: "Business", value: "business" },
    { label: "Finance", value: "finance" },
  ];
  const tags = watch("tags") || [];
  const selectedOptions = communityTags.filter((opt) =>
    tags.includes(opt.value)
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">{t("tags.label")}</Label>
      <MultiSelect
        options={communityTags}
        value={selectedOptions}
        onChange={(options) =>
          setValue(
            "tags",
            options.map((opt) => opt.value),
            { shouldValidate: true }
          )
        }
        placeholder={t("tags.placeholder")}
      />
      <input type="hidden" {...register("tags")} value={tags} />
      <FormError error={errors.tags?.message} />
    </div>
  );
};

export default CommunityTags;
