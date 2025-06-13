/**
 * useChannelSections - Explications d'architecture
 *
 * Ce custom hook centralise toute la logique métier de gestion des channels Discord pour une communauté.
 * Il regroupe :
 *   - Les états locaux (noms des salons, valeurs de renommage)
 *   - Les setters associés
 *   - Les actions (création, renommage de salons)
 *   - Les données calculées (salons manquants, IDs, loading, etc.)
 *
 * Il encapsule également tous les hooks de récupération/mutation de données (useListChannels, useDiscordServer, etc.)
 *
 * Le hook expose un objet structuré :
 *   - isLoading : booléen global de chargement
 *   - allIdsNull : booléen indiquant si aucun salon n'est encore assigné
 *   - state : { names, setNames, rename, setRename } (états locaux)
 *   - actions : { handleCreateMissingChannels, handleRename } (actions principales)
 *   - meta : { missing, isLoadingCreate, isLoadingRename, listData, channelIds } (infos techniques)
 *
 * Utilisation dans le composant principal :
 *   const { isLoading, allIdsNull, state, actions, meta } = useChannelSections(communityId);
 *
 * Puis on passe {...state} {...actions} {...meta} au composant ChannelSections, ce qui permet de garder le composant principal ultra-léger et découplé de la logique métier.
 *
 * Avantages :
 *   - Toute la logique métier est centralisée
 *   - Le composant principal ne fait que composer des sous-composants
 *   - Facile à faire évoluer ou à réutiliser ailleurs
 *
 * Voir aussi :
 *   - ChannelSections (affichage des sections de salons)
 *   - ManageIntegrations (composant principal)
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useListChannels } from "./useListChannels";
import { useCreateChannels } from "./useCreateChannels";
import { useRenameChannels } from "./useRenameChannels";
import { useDiscordServer } from "./useDiscordServer";
import { useUpdateDiscordServer } from "./useUpdateDiscordServer";
import {
  getChannelName,
  getMissingChannels,
  getChannelIdByName,
  getExistingChannelNames,
} from "../utils/channelUtils";
import { ChannelNames } from "@/types/channelNames";
import { waitForValue } from "@/utils/wait-for-value";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useChannelSections(communityId: number) {
  const t = useTranslations("manageIntegrations");
  // --- États locaux ---
  const [names, setNames] = useState<ChannelNames>({
    propose: "propositions",
    vote: "votes",
    result: "résultats",
  });
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
  } = useListChannels(discordServerData?.guildId || "");

  const { mutate: createChannels, isPending: isLoadingCreate } =
    useCreateChannels();
  const { mutate: renameChannels, isPending: isLoadingRename } =
    useRenameChannels();
  const { mutate: updateDiscordServer } = useUpdateDiscordServer();

  // --- Utilitaires dérivés ---
  const channelIds = useMemo(
    () => ({
      propose: discordServerData?.proposeChannelId,
      vote: discordServerData?.voteChannelId,
      result: discordServerData?.resultChannelId,
    }),
    [discordServerData]
  );

  const missing = useMemo(
    () => getMissingChannels(listData, channelIds),
    [listData, channelIds]
  );
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
        getExistingChannelNames(
          listData,
          {
            propose: discordServerData.proposeChannelId,
            vote: discordServerData.voteChannelId,
            result: discordServerData.resultChannelId,
          },
          t
        )
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
      if (!discordServerData?.guildId) return;
      const missingFields = Object.entries(missing).filter(
        ([key, isMissing]) =>
          isMissing && !channelNames[key as keyof typeof channelNames]
      );
      if (missingFields.length > 0) {
        toast.error(t("errorMissingName"));
        return;
      }

      channelNames = {
        propose: channelNames.propose.toLowerCase(),
        vote: channelNames.vote.toLowerCase(),
        result: channelNames.result.toLowerCase(),
      };

      createChannels(
        {
          guildId: discordServerData.guildId,
          proposeName: missing.propose ? channelNames.propose : "",
          voteName: missing.vote ? channelNames.vote : "",
          resultName: missing.result ? channelNames.result : "",
        },
        {
          onSuccess: async () => {
            const listResult = await refetchList();
            updateDiscordServer({
              guildId: discordServerData.guildId,
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
              toast.error(t("errorSync"));
              return;
            }

            toast.success(t("successCreate"));
          },
          onError: (error) => {
            toast.error(error?.message || t("errorCreate"));
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
      t,
    ]
  );

  // --- Gestion du renommage d'un salon ---
  const handleRename = useCallback(
    (type: keyof ChannelNames) => {
      if (!discordServerData?.guildId) return;
      const oldNames = {
        propose: getChannelName(listData, discordServerData?.proposeChannelId),
        vote: getChannelName(listData, discordServerData?.voteChannelId),
        result: getChannelName(listData, discordServerData?.resultChannelId),
      };
      const newNames = { ...oldNames, [type]: rename[type] };
      let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
        toast.warning(t("warningRename"), { duration: 20000 });
      }, 5000);
      renameChannels(
        {
          guildId: discordServerData.guildId,
          oldNames,
          newNames,
        },
        {
          onSuccess: async () => {
            if (timeoutId) clearTimeout(timeoutId);
            const listResult = await refetchList();
            const discordServerResult = await refetchDiscordServer();
            if (!discordServerResult.data) {
              toast.error(t("errorFetchServer"));
              return;
            }
            updateDiscordServer({
              guildId: discordServerResult.data.guildId,
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
            toast.success(t("successRename"));
            setRename((prev) => ({ ...prev, [type]: "" }));
          },
          onError: (error) => {
            if (timeoutId) clearTimeout(timeoutId);
            toast.error(error?.message || t("errorRename"));
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
      t,
    ]
  );

  return {
    isLoading: isLoadingDiscordServer || isLoadingList,
    allIdsNull,
    state: { names, setNames, rename, setRename },
    actions: { handleCreateMissingChannels, handleRename },
    meta: {
      missing,
      isLoadingCreate,
      isLoadingRename,
      listData,
      channelIds,
    },
  };
}
