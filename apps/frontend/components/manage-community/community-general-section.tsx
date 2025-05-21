import { Label, Input, Textarea } from "@repo/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui";
import { useTranslations } from "next-intl";

interface Props {
  form: any;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelect: (name: string, value: string) => void;
  communityTypes: { value: string; label: string }[];
}

export function CommunityGeneralSection({
  form,
  handleChange,
  handleSelect,
  communityTypes,
}: Props) {
  const t = useTranslations("manageCommunity");

  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">{t("general.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("general.intro")}</p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t("general.name.label")}</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t("general.name.placeholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">{t("general.tags.label")}</Label>
          <Select
            value={form.tags}
            onValueChange={(v) => handleSelect("tags", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("general.tags.placeholder")} />
            </SelectTrigger>
            <SelectContent className="z-50">
              {communityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t("general.description.label")}</Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t("general.description.placeholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="externalLinks">
            {t("general.externalLinks.label")}
          </Label>
          <Input
            id="externalLinks"
            name="externalLinks"
            value={form.externalLinks}
            onChange={handleChange}
            placeholder={t("general.externalLinks.placeholder")}
          />
        </div>
      </div>
    </section>
  );
}
