import { useTranslations } from "next-intl";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/select";
import { MultiSelectCombobox } from "@repo/ui/components/combobox";
import { Separator } from "@repo/ui/components/separator";
import { Button } from "@repo/ui/components/button";

export function PocForm() {
  const tForm = useTranslations("form");
  return (
    <form className="flex flex-col gap-4 p-2">
      <div className="flex gap-2">
        <Input
          name="nom"
          type="text"
          placeholder={tForm("lastname")}
          required
        />
        <Input
          name="prenom"
          type="text"
          placeholder={tForm("firstname")}
          required
        />
      </div>
      <Input name="email" type="email" placeholder={tForm("email")} required />
      <Separator className="my-4" />
      <div>
        <label className="block font-medium mb-1">{tForm("expertise")}</label>
        <Select name="expertise" required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={tForm("expertise_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tech">Tech</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <label className="block font-medium mb-1">
          {tForm("community_size")}
        </label>
        <Select name="taille" required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={tForm("community_size_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Moins de 100">
              {tForm("community_size_less_than_100")}
            </SelectItem>
            <SelectItem value="Plus de 100">
              {tForm("community_size_more_than_100")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div>
        <label className="block font-medium mb-1">{tForm("platforms")}</label>
        <MultiSelectCombobox
          name="plateformes"
          options={[
            { value: "Discord", label: "Discord" },
            { value: "WhatsApp", label: "WhatsApp" },
            { value: "YouTube", label: "YouTube" },
            { value: "LinkedIn", label: "LinkedIn" },
            { value: "Spotify", label: "Spotify" },
          ]}
          placeholder={tForm("platforms_placeholder")}
        />
      </div>
      <Button type="submit" className="w-full mt-2">
        {tForm("submit")}
      </Button>
    </form>
  );
}
