import { RadioGroup, RadioGroupItem } from "@repo/ui";
import { Label } from "@repo/ui";
import { Tooltip, TooltipTrigger, TooltipContent } from "@repo/ui";
import { Info } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  t: (key: string) => string;
}

export function CommunityMembershipType({ value, onChange, error, t }: Props) {
  return (
    <div className="space-y-2">
      <Label>{t("membership.label")}</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex flex-col space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="free" id="free" />
          <Label htmlFor="free" className="font-normal">
            {t("membership.free")}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("membership.freeTooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paid" id="paid" />
          <Label htmlFor="paid" className="font-normal">
            {t("membership.paid")}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("membership.paidTooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </RadioGroup>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
