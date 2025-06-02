import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { Tooltip, TooltipTrigger, TooltipContent } from "@repo/ui";
import { Info } from "lucide-react";
import { FormError } from "../../../create-community/CreateFormCommu";

interface Props {
  price: number;
  yourPercentage: number;
  communityPercentage: number;
  snowledgePercentage: number;
  errors: any;
  register: any;
  t: (key: string) => string;
  totalRepartition: number;
  repartitionError?: string;
}

export function CommunityRevenueDistribution({
  price,
  yourPercentage,
  communityPercentage,
  snowledgePercentage,
  errors,
  register,
  t,
  totalRepartition,
  repartitionError,
}: Props) {
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <h4 className="text-sm font-medium">{t("membership.revenueTitle")}</h4>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <Label htmlFor="your-percentage">{t("membership.yourLabel")}</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="your-percentage"
                type="number"
                min="0"
                max="85"
                className="pr-8"
                {...register("yourPercentage", { valueAsNumber: true })}
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                %
              </span>
            </div>
            <div className="w-20 px-3 py-2 bg-background border rounded-md text-sm text-muted-foreground">
              <span>
                {price && yourPercentage
                  ? `$${((price * yourPercentage) / 100).toFixed(2)}`
                  : "$0.00"}
              </span>
            </div>
          </div>
          <FormError error={errors.yourPercentage?.message} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="community-percentage">
              {t("membership.communityLabel")}
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("membership.communityTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="community-percentage"
                type="number"
                min="0"
                max="85"
                className="pr-8"
                {...register("communityPercentage", { valueAsNumber: true })}
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                %
              </span>
            </div>
            <div className="w-20 px-3 py-2 bg-background border rounded-md text-sm text-muted-foreground">
              <span>
                {price && communityPercentage
                  ? `$${((price * communityPercentage) / 100).toFixed(2)}`
                  : "$0.00"}
              </span>
            </div>
          </div>
          <FormError error={errors.communityPercentage?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="snowledge-percentage">
            {t("membership.snowledgeLabel")}
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="snowledge-percentage"
                type="number"
                value={snowledgePercentage}
                readOnly
                className="pr-8 bg-muted"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                %
              </span>
            </div>
            <div className="w-20 px-3 py-2 bg-muted border rounded-md text-sm text-muted-foreground">
              <span>
                {price
                  ? `$${((price * snowledgePercentage) / 100).toFixed(2)}`
                  : "$0.00"}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("membership.platformFee")}
          </p>
        </div>
      </div>
      <div className="pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span>{t("membership.total")}</span>
          <span className="font-medium">{totalRepartition}%</span>
        </div>
        {repartitionError && (
          <p className="text-xs text-red-500 mt-1">{repartitionError}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {t("membership.editableHint")}
        </p>
      </div>
    </div>
  );
}
