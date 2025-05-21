import { Label, Input } from "@repo/ui";
import { useTranslations } from "next-intl";

interface Props {
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CommunityGainsSection({ form, handleChange }: Props) {
  const t = useTranslations("manageCommunity");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">{t("gains.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("gains.description")}
        </p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="adminShare">{t("gains.adminShare.label")}</Label>
          <Input
            id="adminShare"
            name="adminShare"
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.adminShare}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prizePoolShare">
            {t("gains.prizePoolShare.label")}
          </Label>
          <Input
            id="prizePoolShare"
            name="prizePoolShare"
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.prizePoolShare}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="platformShare">
            {t("gains.platformShare.label")}
          </Label>
          <Input
            id="platformShare"
            name="platformShare"
            type="number"
            min="0"
            max="100"
            step="1"
            value={form.platformShare}
            readOnly
            disabled
          />
        </div>
        <span className="text-muted-foreground text-sm">
          {t("gains.totalHint")}
        </span>
        <div className="border rounded-lg p-4 mt-4 bg-muted">
          <h3 className="font-semibold mb-2 text-base">
            {t("gains.internal.title")}
          </h3>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="prizeCreation">
                {t("gains.internal.prizeCreation.label")}
              </Label>
              <Input
                id="prizeCreation"
                name="prizeCreation"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.prizeCreation}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prizeRevision">
                {t("gains.internal.prizeRevision.label")}
              </Label>
              <Input
                id="prizeRevision"
                name="prizeRevision"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.prizeRevision}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prizeAnimation">
                {t("gains.internal.prizeAnimation.label")}
              </Label>
              <Input
                id="prizeAnimation"
                name="prizeAnimation"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.prizeAnimation}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="prizeSharing">
                {t("gains.internal.prizeSharing.label")}
              </Label>
              <Input
                id="prizeSharing"
                name="prizeSharing"
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.prizeSharing}
                onChange={handleChange}
              />
            </div>
          </div>
          <span className="text-muted-foreground text-xs block mt-2">
            {t("gains.internal.totalHint")}
          </span>
        </div>
      </div>
    </section>
  );
}
