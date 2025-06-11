import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useListChannels } from "./hooks/useListChannels";
import { useCreateChannels } from "./hooks/useCreateChannels";
import { useRenameChannels } from "./hooks/useRenameChannels";
import { useDiscordServer } from "./hooks/useDiscordServer";
import { useUpdateDiscordServer } from "./hooks/useUpdateDiscordServer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
import { ChannelSection } from "./ChannelSection";
import { AlertInfo } from "./AlertInfo";
import {
  getChannelName,
  getMissingChannels,
  getChannelIdByName,
  getExistingChannelNames,
} from "./utils/channelUtils";
import { ChannelNames } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { HelpCircle } from "lucide-react";
import { waitForValue } from "@/utils/wait-for-value";

interface Props {
  communityId: number;
}

/**
 * Composant principal de gestion des intégrations Discord pour une communauté.
 * Permet la création, l'affectation et le renommage des salons Discord nécessaires.
 */
export const ManageIntegrations: React.FC<Props> = ({ communityId }) => {
  // --- États locaux ---
  // Noms des salons à créer ou à afficher
  const [names, setNames] = useState<ChannelNames>({
    propose: "propositions",
    vote: "votes",
    result: "résultats",
  });
  // Valeurs temporaires pour le renommage
  const [rename, setRename] = useState<ChannelNames>({
    propose: "",
    vote: "",
    result: "",
  });

  // --- Récupération des données et mutations ---
  const {
    data: discordServerData,
    isLoading: isLoadingDiscordServer,
    refetch: refetchDiscordServer,
  } = useDiscordServer(communityId);

  const {
    data: listData,
    isLoading: isLoadingList,
    refetch: refetchList,
  } = useListChannels(discordServerData?.discordGuildId || "");

  const { mutate: createChannels, isPending: isLoadingCreate } =
    useCreateChannels();
  const { mutate: renameChannels, isPending: isLoadingRename } =
    useRenameChannels();
  const { mutate: updateDiscordServer } = useUpdateDiscordServer();

  // --- Utilitaires dérivés ---
  // IDs des salons actuellement assignés
  const channelIds = useMemo(
    () => ({
      propose: discordServerData?.proposeChannelId,
      vote: discordServerData?.voteChannelId,
      result: discordServerData?.resultChannelId,
    }),
    [discordServerData]
  );

  // Détection des salons manquants
  const missing = useMemo(() => {
    const res = getMissingChannels(listData, channelIds);
    return res;
  }, [listData, channelIds]);
  // Vérifie si aucun salon n'est encore assigné
  const allIdsNull = useMemo(
    () =>
      discordServerData &&
      !discordServerData.proposeChannelId &&
      !discordServerData.voteChannelId &&
      !discordServerData.resultChannelId,
    [discordServerData]
  );

  // --- Effet : synchronisation des noms avec la réalité Discord ---
  useEffect(() => {
    if (listData && discordServerData) {
      setNames(
        getExistingChannelNames(listData, {
          propose: discordServerData.proposeChannelId,
          vote: discordServerData.voteChannelId,
          result: discordServerData.resultChannelId,
        })
      );
    }
  }, [
    listData,
    discordServerData?.proposeChannelId,
    discordServerData?.voteChannelId,
    discordServerData?.resultChannelId,
  ]);

  // --- Gestion de la création des salons manquants ---
  const handleCreateMissingChannels = useCallback(
    (channelNames: ChannelNames) => {
      if (!discordServerData?.discordGuildId) return;
      // Vérifie que tous les noms sont renseignés pour les salons manquants
      const missingFields = Object.entries(missing).filter(
        ([key, isMissing]) =>
          isMissing && !channelNames[key as keyof typeof channelNames]
      );
      if (missingFields.length > 0) {
        toast.error("Merci de renseigner un nom pour chaque salon manquant.");
        return;
      }

      createChannels(
        {
          guildId: discordServerData.discordGuildId,
          proposeName: missing.propose ? channelNames.propose : "",
          voteName: missing.vote ? channelNames.vote : "",
          resultName: missing.result ? channelNames.result : "",
        },
        {
          onSuccess: async () => {
            const listResult = await refetchList();

            // Met à jour la BDD avec les bons IDs
            updateDiscordServer({
              id: discordServerData.id,
              proposeChannelId: missing.propose
                ? getChannelIdByName(listResult.data, channelNames.propose)
                : discordServerData.proposeChannelId,
              voteChannelId: missing.vote
                ? getChannelIdByName(listResult.data, channelNames.vote)
                : discordServerData.voteChannelId,
              resultChannelId: missing.result
                ? getChannelIdByName(listResult.data, channelNames.result)
                : discordServerData.resultChannelId,
            });

            // Attendre la propagation côté backend
            const expectedResultId = getChannelIdByName(
              listResult.data,
              channelNames.result
            );
            const refreshed = await waitForValue(
              refetchDiscordServer,
              (result) => result.data?.resultChannelId === expectedResultId,
              { intervalMs: 1000, maxTries: 5 }
            );

            if (!refreshed) {
              toast.error("La synchronisation avec le serveur a échoué.");
              return;
            }

            toast.success("Salon(s) créé(s) avec succès !");
          },
          onError: (error) => {
            toast.error(
              error?.message || "Erreur lors de la création des salons Discord."
            );
          },
        }
      );
    },
    [
      discordServerData,
      missing,
      names,
      createChannels,
      refetchList,
      refetchDiscordServer,
      updateDiscordServer,
    ]
  );

  // --- Gestion du renommage d'un salon ---
  const handleRename = useCallback(
    (type: keyof ChannelNames) => {
      if (!discordServerData?.discordGuildId) return;
      // Récupère les anciens noms pour l'appel API
      const oldNames = {
        propose: getChannelName(listData, discordServerData?.proposeChannelId),
        vote: getChannelName(listData, discordServerData?.voteChannelId),
        result: getChannelName(listData, discordServerData?.resultChannelId),
      };
      // Prépare les nouveaux noms
      const newNames = { ...oldNames, [type]: rename[type] };
      // Timeout pour prévenir l'utilisateur en cas de lenteur (limite Discord)
      let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
        toast.warning(
          "Le renommage prend plus de 5 secondes. Vous avez probablement atteint la limite Discord (2 renommages toutes les 10 minutes). Veuillez patienter 10 minutes ou renommer le salon directement sur Discord.",
          { duration: 20000 }
        );
      }, 5000);
      renameChannels(
        {
          guildId: discordServerData.discordGuildId,
          oldNames,
          newNames,
        },
        {
          onSuccess: async () => {
            if (timeoutId) clearTimeout(timeoutId);
            const listResult = await refetchList();
            const discordServerResult = await refetchDiscordServer();
            if (!discordServerResult.data) {
              toast.error(
                "Erreur lors de la récupération des données du serveur Discord."
              );
              return;
            }
            // Met à jour les IDs des salons renommés
            updateDiscordServer({
              id: discordServerResult.data.id,
              proposeChannelId: getChannelIdByName(
                listResult.data,
                newNames.propose
              ),
              voteChannelId: getChannelIdByName(listResult.data, newNames.vote),
              resultChannelId: getChannelIdByName(
                listResult.data,
                newNames.result
              ),
            });
            toast.success("Salon renommé avec succès !");
            setRename((prev) => ({ ...prev, [type]: "" }));
          },
          onError: (error) => {
            if (timeoutId) clearTimeout(timeoutId);
            toast.error(
              error?.message || "Erreur lors du renommage du salon Discord."
            );
          },
        }
      );
    },
    [
      discordServerData,
      listData,
      rename,
      renameChannels,
      refetchList,
      refetchDiscordServer,
      updateDiscordServer,
    ]
  );

  // --- Affichage du loader si les données sont en cours de chargement ---
  if (isLoadingDiscordServer || isLoadingList) {
    return <div>Chargement...</div>;
  }

  // --- Génération dynamique des sections de salons ---
  const renderChannelSections = (mode: "firstConfig" | "edition") => (
    <div className="space-y-4">
      {(["propose", "vote", "result"] as const).map((type) => (
        <ChannelSection
          key={type}
          type={type}
          label={`Salon ${type === "propose" ? "propositions" : type === "vote" ? "votes" : "résultats"}`}
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
              ? type === "propose"
                ? "propositions"
                : type === "vote"
                  ? "votes"
                  : "résultats"
              : getChannelName(listData, channelIds[type]) ||
                (type === "propose"
                  ? "propositions"
                  : type === "vote"
                    ? "votes"
                    : "résultats")
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
              toast.error("Merci de renseigner un nom pour chaque salon.");
              return;
            }
            handleCreateMissingChannels(names);
          }}
        >
          Créer les salons
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
              ? "Créer les salons manquants"
              : "Créer le salon manquant"}
          </Button>
        )
      )}
    </div>
  );

  // --- Rendu principal ---
  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Gestion des channels Discord</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {allIdsNull ? (
          <>
            {/* Première configuration : aucun salon n'est encore assigné */}
            <AlertInfo
              variant="destructive"
              title="Première configuration des channels Discord"
              description={
                <>
                  Aucun channel n'est encore affecté pour les propositions,
                  votes ou résultats.
                  <br />
                  Veuillez choisir un nom pour chaque salon, puis cliquez sur
                  "Créer les salons".
                </>
              }
              className="mb-4"
            />
            {renderChannelSections("firstConfig")}
          </>
        ) : (
          <>
            {/* Alerte sur la limitation Discord */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-base">
                Limitation Discord
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-pointer">
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs text-sm"
                  >
                    <b>Attention :</b> Si vous essayez de renommer un même salon
                    une 3ème fois dans ce délai,{" "}
                    <b>
                      toutes les modifications de salons seront bloquées pendant
                      10 minutes.
                    </b>
                    <br />
                    <br />
                    Vous pouvez continuer à modifier les autres salons tant que
                    la limite n'est pas atteinte pour chacun.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <AlertInfo
              title="Limitation Discord"
              description={
                <span>
                  Chaque salon Discord peut être renommé jusqu'à{" "}
                  <strong>2 fois toutes les 10 minutes</strong>, indépendamment
                  des autres salons.
                  <br />
                  <br />
                  <i>
                    Si besoin, vous pouvez toujours renommer les salons
                    directement depuis Discord.
                  </i>
                </span>
              }
              className="mb-4"
            />
            {/* Edition/renommage des salons existants */}
            <AlertInfo
              title="Salons Discord assignés"
              description="Vous pouvez renommer chaque salon si besoin."
              className="mb-4"
            />
            {renderChannelSections("edition")}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageIntegrations;
