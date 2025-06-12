import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export const DiscordLimitationTooltip: React.FC = () => {
  const t = useTranslations("manageIntegrations");
  const blockedMsg = t.rich("discordLimitationTooltipBlocked", {
    b: (chunks) => <b>{chunks}</b>,
  });
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-pointer">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs text-sm">
          <b>{t("discordLimitationTooltipAttention")}</b> {blockedMsg}
          <br />
          <br />
          {t("discordLimitationTooltipOtherChannels")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DiscordLimitationTooltip;
