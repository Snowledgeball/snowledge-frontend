import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/card";
import { DiscordLimitationTooltip } from "./components/DiscordLimitationTooltip";
import { DiscordLimitationAlert } from "./components/DiscordLimitationAlert";
import { FirstConfigAlert } from "./components/FirstConfigAlert";
import { AssignedChannelsAlert } from "./components/AssignedChannelsAlert";
import { ChannelSections } from "./components/ChannelSections";
import { useChannelSections } from "./hooks/useChannelSections";
import { useTranslations } from "next-intl";

/**
 * ManageIntegrations - Explications d'architecture
 *
 * Ce composant est le point d'entrée principal pour la gestion des intégrations Discord d'une communauté.
 * Il ne contient aucune logique métier directe : il délègue toute la logique d'état, d'actions et de calculs au custom hook useChannelSections.
 *
 * Il se contente de composer des sous-composants d'affichage :
 *   - ChannelSections (affichage et gestion des sections de salons)
 *   - Diverses alertes et tooltips (FirstConfigAlert, DiscordLimitationAlert, etc.)
 *
 * Le hook useChannelSections lui fournit tout ce dont il a besoin (états, actions, données calculées) sous forme d'objets, qu'il transmet aux sous-composants via spread {...state} {...actions} {...meta}.
 *
 * Avantages :
 *   - Le composant principal reste ultra-léger, lisible et découplé de la logique métier
 *   - Toute la logique complexe est centralisée dans le hook
 *   - L'affichage est facilement modulaire et évolutif
 *
 * Voir aussi :
 *   - useChannelSections (logique métier)
 *   - ChannelSections (affichage des sections de salons)
 */

interface Props {
  communityId: number;
}

export const ManageIntegrations: React.FC<Props> = ({ communityId }) => {
  const t = useTranslations("manageIntegrations");
  const { isLoading, allIdsNull, state, actions, meta } =
    useChannelSections(communityId);

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {allIdsNull ? (
          <>
            <FirstConfigAlert />
            <ChannelSections
              mode="firstConfig"
              {...state}
              {...actions}
              {...meta}
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-base">
                {t("discordLimitation")}
              </span>
              <DiscordLimitationTooltip />
            </div>
            <DiscordLimitationAlert />
            <AssignedChannelsAlert />
            <ChannelSections mode="edition" {...state} {...actions} {...meta} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageIntegrations;
