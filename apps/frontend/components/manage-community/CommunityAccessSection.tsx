import { Label, Input, Switch } from "@repo/ui";
import { useTranslations } from "next-intl";
import { CommunityMembershipType } from "../shared/community/fields/CommunityMembershipType";

interface Props {
  value: string;
  onChange: (value: string) => void;
  errors: any;
}

export function CommunityAccessSection({ value, onChange, errors }: Props) {
  const t = useTranslations("communityForm");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">
          {t("manage.access.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("manage.access.description")}
        </p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <CommunityMembershipType
          value={value}
          onChange={onChange}
          error={errors.communityType?.message}
          t={t}
        />
      </div>
    </section>
  );
}
