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
import { ChannelSection } from "./components/ChannelSection";
import {
  getChannelName,
  getMissingChannels,
  getChannelIdByName,
  getExistingChannelNames,
} from "./utils/channelUtils";
import { ChannelNames } from "./types";
import { waitForValue } from "@/utils/wait-for-value";
import { DiscordLimitationTooltip } from "./components/DiscordLimitationTooltip";
import { DiscordLimitationAlert } from "./components/DiscordLimitationAlert";
import { FirstConfigAlert } from "./components/FirstConfigAlert";
import { AssignedChannelsAlert } from "./components/AssignedChannelsAlert";
import { ChannelSections } from "./components/ChannelSections";

interface Props {
  communityId: number;
}

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
            <FirstConfigAlert />
            <ChannelSections
              mode="firstConfig"
              names={names}
              setNames={setNames}
              rename={rename}
              setRename={setRename}
              missing={missing}
              isLoadingCreate={isLoadingCreate}
              isLoadingRename={isLoadingRename}
              handleCreateMissingChannels={handleCreateMissingChannels}
              handleRename={handleRename}
              listData={listData}
              channelIds={channelIds}
            />
          </>
        ) : (
          <>
            {/* Alerte sur la limitation Discord */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-semibold text-base">
                Limitation Discord
              </span>
              <DiscordLimitationTooltip />
            </div>
            <DiscordLimitationAlert />
            {/* Edition/renommage des salons existants */}
            <AssignedChannelsAlert />
            <ChannelSections
              mode="edition"
              names={names}
              setNames={setNames}
              rename={rename}
              setRename={setRename}
              missing={missing}
              isLoadingCreate={isLoadingCreate}
              isLoadingRename={isLoadingRename}
              handleCreateMissingChannels={handleCreateMissingChannels}
              handleRename={handleRename}
              listData={listData}
              channelIds={channelIds}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageIntegrations;
