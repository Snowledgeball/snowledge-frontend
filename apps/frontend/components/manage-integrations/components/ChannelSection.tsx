/**
 * ChannelSection - Explications d'architecture
 *
 * Ce composant gère l'affichage d'une section individuelle pour un salon Discord (propositions, votes ou résultats).
 * Il reçoit toutes ses props du composant parent ChannelSections :
 *   - type, label, value, onChange, placeholder, onValidate, isLoading, isMissing
 *
 * Il affiche :
 *   - Un input pour le nom du salon (ChannelInput)
 *   - Une alerte si le salon est manquant ou supprimé
 *   - Un bouton de validation si besoin (renommage)
 *
 * Il ne contient aucune logique métier : il ne fait que gérer l'affichage et relayer les callbacks/actions.
 *
 * Avantages :
 *   - Ultra-simple, facile à tester
 *   - Réutilisable pour n'importe quel type de salon
 *   - Séparation stricte entre logique et UI
 *
 * Voir aussi :
 *   - ChannelSections (affichage dynamique de toutes les sections)
 *   - useChannelSections (logique métier)
 */
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/alert";
import { ChannelInput } from "./ChannelInput";
import { ChannelNames } from "@/types/channelNames";
import { KindOfMissing } from "@/types/kindOfMissing";
import { useTranslations } from "next-intl";

interface ChannelSectionProps {
  type: keyof ChannelNames;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onValidate?: () => void;
  isLoading: boolean;
  isMissing: KindOfMissing;
}

export const ChannelSection: React.FC<ChannelSectionProps> = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  onValidate,
  isLoading,
  isMissing,
}) => {
  const t = useTranslations("manageIntegrations");
  return (
    <div>
      <label>{label}</label>
      {isMissing.all || isMissing.channelName?.[type] ? (
        <>
          {isMissing.channelName?.[type] && (
            <Alert variant="destructive" className="mb-2">
              <AlertTitle>{t("missingTitle")}</AlertTitle>
              <AlertDescription>
                {t("missingDescription", { label: label.toLowerCase() })}
                <br />
                {t("missingDescription2")}
              </AlertDescription>
            </Alert>
          )}
          <ChannelInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={isLoading}
            canRename={false}
          />
        </>
      ) : (
        <ChannelInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onValidate={onValidate}
          disabled={isLoading}
          canRename={true}
        />
      )}
    </div>
  );
};
