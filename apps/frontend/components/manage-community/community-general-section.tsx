import { Label, Input, Textarea } from "@repo/ui";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui";

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
  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">Informations générales</h2>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations principales de votre communauté.
        </p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nom de la communauté"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Type / Tags</Label>
          <Select
            value={form.tags}
            onValueChange={(v) => handleSelect("tags", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisissez un type" />
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Décrivez la communauté..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="externalLinks">Liens externes</Label>
          <Input
            id="externalLinks"
            name="externalLinks"
            value={form.externalLinks}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
      </div>
    </section>
  );
}
