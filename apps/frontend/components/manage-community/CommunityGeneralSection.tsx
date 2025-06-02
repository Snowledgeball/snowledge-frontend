import { useTranslations } from "next-intl";
import CommunityName from "../shared/community/fields/CommunityName";
import CommunityTags from "../shared/community/fields/CommunityTags";
import { CommunityDescriptionField } from "../shared/community/fields/CommunityDescriptionField";
import { CommunityCodeOfConductField } from "../shared/community/fields/CommunityCodeOfConductField";

interface Props {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
}

export function CommunityGeneralSection({
  register,
  errors,
  setValue,
  watch,
}: Props) {
  const t = useTranslations("communityForm");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">
          {t("manage.general.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("manage.general.intro")}
        </p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <CommunityName register={register} errors={errors} />
        </div>
        <div className="space-y-2">
          <CommunityTags
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />
        </div>
        <div className="space-y-2">
          <CommunityDescriptionField register={register} errors={errors} />
        </div>
        <div className="space-y-2">
          <CommunityCodeOfConductField
            register={register}
            errors={errors}
            t={t}
          />
        </div>
      </div>
    </section>
  );
}
