import { Label, Input, Switch } from "@repo/ui";
import { useTranslations } from "next-intl";

interface Props {
  isFree: boolean;
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsFree: (checked: boolean) => void;
}

export function CommunityAccessSection({
  isFree,
  form,
  handleChange,
  setIsFree,
}: Props) {
  const t = useTranslations("manageCommunity");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">{t("access.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("access.description")}
        </p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="isFree">{t("access.isFree.label")}</Label>
          <Switch
            checked={form.isFree}
            onCheckedChange={(checked) => {
              setIsFree(checked);
              handleChange({
                target: { name: "isFree", value: checked, type: "checkbox" },
              } as any);
            }}
          />
          <span className="text-muted-foreground text-sm">
            {t("access.isFree.description")}
          </span>
        </div>
        {!isFree && (
          <div className="space-y-2">
            <Label htmlFor="price">{t("access.price.label")}</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder={t("access.price.placeholder")}
            />
          </div>
        )}
      </div>
    </section>
  );
}
