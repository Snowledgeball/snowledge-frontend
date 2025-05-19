import { Label, Input } from "@repo/ui";

interface Props {
  form: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CommunityGainsSection({ form, handleChange }: Props) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
      <div className="col-span-8 lg:col-span-4">
        <h2 className="text-lg font-semibold mb-1">Répartition des gains</h2>
        <p className="text-sm text-muted-foreground">
          Définissez la part des gains pour l'admin, le prize pool et la
          plateforme (total = 100%).
        </p>
      </div>
      <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="adminShare">Part pour l'admin (%)</Label>
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
          <Label htmlFor="prizePoolShare">Part pour le prize pool (%)</Label>
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
          <Label htmlFor="platformShare">Part pour la plateforme (%)</Label>
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
          Le total doit faire 100%.
        </span>
        <div className="border rounded-lg p-4 mt-4 bg-muted">
          <h3 className="font-semibold mb-2 text-base">
            Répartition interne du prize pool
          </h3>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="prizeCreation">Création (%)</Label>
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
              <Label htmlFor="prizeRevision">Révision (%)</Label>
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
              <Label htmlFor="prizeAnimation">Animation (%)</Label>
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
              <Label htmlFor="prizeSharing">Partage / Invitations (%)</Label>
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
            Le total doit faire 100% pour la répartition interne du prize pool.
          </span>
        </div>
      </div>
    </section>
  );
}
