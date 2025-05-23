import { Label, Input } from "@repo/ui";
import { FormError } from "../CreateFormCommu";

export function CommunityPriceField({ register, error, t, price }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor="price">{t("membership.priceLabel")}</Label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          $
        </span>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          placeholder={t("membership.pricePlaceholder")}
          className="pl-7"
          {...register("price", { valueAsNumber: true })}
        />
      </div>
      <FormError error={error} />
    </div>
  );
}
