/**
 * ChannelSections - Explications d'architecture
 *
 * Ce composant gère l'affichage dynamique des sections de salons Discord (propositions, votes, résultats).
 * Il reçoit toutes ses props (états, setters, actions, meta) du composant parent (ManageIntegrations),
 * via le hook useChannelSections.
 *
 * Il se charge d'afficher pour chaque type de salon :
 *   - Un ChannelSection (input + éventuelle alerte)
 *   - Le bouton de création ou de création des salons manquants
 *
 * Il ne contient aucune logique métier : il ne fait qu'orchestrer l'affichage et relayer les callbacks/actions.
 *
 * Avantages :
 *   - Séparation stricte entre logique métier (dans le hook) et affichage (dans ce composant)
 *   - Facile à tester et à faire évoluer
 *   - Réutilisable pour d'autres contextes si besoin
 *
 * Voir aussi :
 *   - ChannelSection (affichage d'une section individuelle)
 *   - useChannelSections (logique métier)
 *   - ManageIntegrations (composant principal)
 */
import React from "react";
import { Button } from "@repo/ui/components/button";
import { ChannelSection } from "./ChannelSection";
import { ChannelNames } from "@/types/channelNames";
import { getChannelName } from "../utils/channelUtils";
import { useTranslations } from "next-intl";

interface ChannelSectionsProps {
  mode: "firstConfig" | "edition";
  names: ChannelNames;
  setNames: React.Dispatch<React.SetStateAction<ChannelNames>>;
  rename: ChannelNames;
  setRename: React.Dispatch<React.SetStateAction<ChannelNames>>;
  missing: Record<keyof ChannelNames, boolean>;
  isLoadingCreate: boolean;
  isLoadingRename: boolean;
  handleCreateMissingChannels: (names: ChannelNames) => void;
  handleRename: (type: keyof ChannelNames) => void;
  listData: any;
  channelIds: Record<keyof ChannelNames, string | undefined>;
}

export const ChannelSections: React.FC<ChannelSectionsProps> = ({
  mode,
  names,
  setNames,
  rename,
  setRename,
  missing,
  isLoadingCreate,
  isLoadingRename,
  handleCreateMissingChannels,
  handleRename,
  listData,
  channelIds,
}) => {
  const t = useTranslations("manageIntegrations");
  const typeLabel = (type: keyof ChannelNames) =>
    type === "propose"
      ? t("propose")
      : type === "vote"
        ? t("vote")
        : t("result");
  return (
    <div className="space-y-4">
      {(["propose", "vote", "result"] as const).map((type) => (
        <ChannelSection
          key={type}
          type={type}
          label={typeLabel(type)}
          value={
            mode === "firstConfig" || missing[type] ? names[type] : rename[type]
          }
          onChange={(v) =>
            mode === "firstConfig" || missing[type]
              ? setNames((prev) => ({ ...prev, [type]: v }))
              : setRename((prev) => ({ ...prev, [type]: v }))
          }
          placeholder={
            mode === "firstConfig"
              ? typeLabel(type)
              : getChannelName(listData, channelIds[type]) || typeLabel(type)
          }
          onValidate={
            mode === "edition" && !missing[type]
              ? () => handleRename(type)
              : undefined
          }
          isLoading={mode === "firstConfig" ? isLoadingCreate : isLoadingRename}
          isMissing={
            mode === "firstConfig"
              ? { all: true }
              : {
                  channelName: {
                    [type]: missing[type] as boolean,
                  },
                }
          }
        />
      ))}
      {mode === "firstConfig" ? (
        <Button
          className="w-full mt-2"
          disabled={
            isLoadingCreate || !names.propose || !names.vote || !names.result
          }
          onClick={() => {
            if (!names.propose || !names.vote || !names.result) {
              return;
            }
            handleCreateMissingChannels(names);
          }}
        >
          {t("createChannels")}
        </Button>
      ) : (
        Object.values(missing).some(Boolean) && (
          <Button
            className="w-full mt-2"
            disabled={
              isLoadingCreate ||
              (missing.propose && !names.propose) ||
              (missing.vote && !names.vote) ||
              (missing.result && !names.result)
            }
            onClick={() => handleCreateMissingChannels(names)}
          >
            {Object.values(missing).filter(Boolean).length > 1
              ? t("createMissingChannels")
              : t("createMissingChannel")}
          </Button>
        )
      )}
    </div>
  );
};

export default ChannelSections;
