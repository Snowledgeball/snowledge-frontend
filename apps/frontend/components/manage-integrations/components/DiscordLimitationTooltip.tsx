import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { HelpCircle } from "lucide-react";

export const DiscordLimitationTooltip: React.FC = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center cursor-pointer">
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" align="center" className="max-w-xs text-sm">
        <b>Attention :</b> Si vous essayez de renommer un même salon une 3ème
        fois dans ce délai,{" "}
        <b>
          toutes les modifications de salons seront bloquées pendant 10 minutes.
        </b>
        <br />
        <br />
        Vous pouvez continuer à modifier les autres salons tant que la limite
        n'est pas atteinte pour chacun.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default DiscordLimitationTooltip;
