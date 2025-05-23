import { Info } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
  Label,
  Input,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function CommunityMembershipType({
  communityType,
  setCommunityType,
}: {
  communityType: string;
  setCommunityType: (v: string) => void;
}) {
  const [price, setPrice] = useState(0);
  const [yourPercentage, setYourPercentage] = useState(70);
  const [communityPercentage, setCommunityPercentage] = useState(15);
  const snowledgePercentage = 15;
  const t = useTranslations("createCommunityForm");

  const yourAmount = ((price * yourPercentage) / 100).toFixed(2);
  const communityAmount = ((price * communityPercentage) / 100).toFixed(2);
  const snowledgeAmount = ((price * snowledgePercentage) / 100).toFixed(2);

  return (
    <div className="space-y-2">
      <RadioGroup
        value={communityType}
        onValueChange={setCommunityType}
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

      {communityType === "paid" && (
        <div className="space-y-4">
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
                value={price}
                onChange={(e) =>
                  setPrice(Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium">
              {t("membership.revenueTitle")}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="your-percentage">
                  {t("membership.yourLabel")}
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="your-percentage"
                      type="number"
                      min="0"
                      max="85"
                      value={yourPercentage}
                      className="pr-8"
                      onChange={(e) =>
                        setYourPercentage(
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <div className="w-20 px-3 py-2 bg-background border rounded-md text-sm text-muted-foreground">
                    <span id="your-projection">${yourAmount}</span>
                  </div>
                </div>
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
                      value={communityPercentage}
                      className="pr-8"
                      onChange={(e) =>
                        setCommunityPercentage(
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <div className="w-20 px-3 py-2 bg-background border rounded-md text-sm text-muted-foreground">
                    <span id="community-projection">${communityAmount}</span>
                  </div>
                </div>
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
                    <span id="snowledge-projection">${snowledgeAmount}</span>
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
                <span className="font-medium">100%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("membership.editableHint")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
