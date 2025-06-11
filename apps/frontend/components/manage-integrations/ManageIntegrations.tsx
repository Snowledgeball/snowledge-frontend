import React, { useState, useEffect } from "react";
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

interface Props {
  communityId: number;
}

export const ManageIntegrations: React.FC<Props> = ({ communityId }) => {
  // États pour la création initiale et le renommage
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

  // Queries et mutations
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

  // Utilitaires
  const channelIds = {
    propose: discordServerData?.proposeChannelId,
    vote: discordServerData?.voteChannelId,
    result: discordServerData?.resultChannelId,
  };

  const missing = getMissingChannels(listData, channelIds);
  const allIdsNull =
    discordServerData &&
    !discordServerData.proposeChannelId &&
    !discordServerData.voteChannelId &&
    !discordServerData.resultChannelId;

  // Synchronise les noms des salons avec la réalité Discord dès que c'est chargé
  useEffect(() => {
    if (
      listData &&
      discordServerData?.proposeChannelId &&
      discordServerData?.voteChannelId &&
      discordServerData?.resultChannelId
    ) {
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

  // Création des salons manquants
  const handleCreateMissingChannels = () => {
    if (!discordServerData?.discordGuildId) return;
    const missingFields = Object.entries(missing).filter(
      ([key, isMissing]) => isMissing && !rename[key as keyof typeof rename]
    );
    if (missingFields.length > 0) {
      toast.error("Merci de renseigner un nom pour chaque salon manquant.");
      return;
    }
    console.log("missing", missing);
    console.log("rename", rename);
    console.log("names", names);
    createChannels(
      {
        guildId: discordServerData.discordGuildId,
        proposeName: missing.propose ? rename.propose : names.propose,
        voteName: missing.vote ? rename.vote : names.vote,
        resultName: missing.result ? rename.result : names.result,
      },
      {
        onSuccess: async () => {
          const listResult = await refetchList();
          const discordServerResult = await refetchDiscordServer();
          if (!discordServerResult.data) {
            toast.error(
              "Erreur lors de la récupération des données du serveur Discord."
            );
            return;
          }
          updateDiscordServer({
            id: discordServerResult.data.id,
            proposeChannelId: missing.propose
              ? getChannelIdByName(listResult.data, rename.propose)
              : discordServerData.proposeChannelId,
            voteChannelId: missing.vote
              ? getChannelIdByName(listResult.data, rename.vote)
              : discordServerData.voteChannelId,
            resultChannelId: missing.result
              ? getChannelIdByName(listResult.data, rename.result)
              : discordServerData.resultChannelId,
          });
          toast.success("Salon(s) créé(s) avec succès !");
        },
        onError: (error) => {
          toast.error(
            error?.message || "Erreur lors de la création des salons Discord."
          );
        },
      }
    );
  };

  // Renommage d'un salon
  const handleRename = (type: "propose" | "vote" | "result") => {
    if (!discordServerData?.discordGuildId) return;
    const oldNames = {
      propose: getChannelName(listData, discordServerData?.proposeChannelId),
      vote: getChannelName(listData, discordServerData?.voteChannelId),
      result: getChannelName(listData, discordServerData?.resultChannelId),
    };
    const newNames = { ...oldNames, [type]: rename[type] };
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
  };

  if (isLoadingDiscordServer || isLoadingList) {
    return <div>Chargement...</div>;
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Gestion des channels Discord</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AlertInfo
          title="Limitation Discord"
          description={
            <>
              Sur cette plateforme, un nom de salon Discord n'est modifiable que{" "}
              <b>deux fois toutes les 10 minutes.</b>
              <br />
              Si vous devez le modifier plus rapidement, vous pouvez le faire
              directement depuis Discord.
            </>
          }
          className="mb-4"
        />
        {allIdsNull ? (
          <>
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
            <div className="space-y-4">
              {(["propose", "vote", "result"] as const).map((type) => (
                <ChannelSection
                  key={type}
                  label={`Nom du salon ${type === "propose" ? "propositions" : type === "vote" ? "votes" : "résultats"}`}
                  value={names[type]}
                  onChange={(v) => setNames((prev) => ({ ...prev, [type]: v }))}
                  placeholder={
                    type === "propose"
                      ? "propositions"
                      : type === "vote"
                        ? "votes"
                        : "résultats"
                  }
                  onValidate={handleCreateMissingChannels}
                  isLoading={isLoadingCreate}
                  isMissing={true}
                />
              ))}
              <Button
                className="w-full mt-2"
                disabled={
                  isLoadingCreate ||
                  !names.propose ||
                  !names.vote ||
                  !names.result
                }
                onClick={() => {
                  if (!names.propose || !names.vote || !names.result) {
                    toast.error(
                      "Merci de renseigner un nom pour chaque salon."
                    );
                    return;
                  }
                  setRename(names); // pour la logique de création
                  handleCreateMissingChannels();
                }}
              >
                Créer les salons
              </Button>
            </div>
          </>
        ) : (
          <>
            <AlertInfo
              title="Salons Discord assignés"
              description="Vous pouvez renommer chaque salon si besoin."
              className="mb-4"
            />
            <div className="space-y-4">
              {(["propose", "vote", "result"] as const).map((type) => (
                <ChannelSection
                  key={type}
                  label={`Salon ${type === "propose" ? "propositions" : type === "vote" ? "votes" : "résultats"}`}
                  value={rename[type]}
                  onChange={(v) =>
                    setRename((prev) => ({ ...prev, [type]: v }))
                  }
                  placeholder={
                    getChannelName(listData, channelIds[type]) ||
                    (type === "propose"
                      ? "propositions"
                      : type === "vote"
                        ? "votes"
                        : "résultats")
                  }
                  onValidate={() => handleRename(type)}
                  isLoading={isLoadingRename}
                  isMissing={missing[type]}
                />
              ))}
              {Object.values(missing).some(Boolean) && (
                <Button
                  className="w-full mt-2"
                  disabled={
                    isLoadingCreate ||
                    (missing.propose && !rename.propose) ||
                    (missing.vote && !rename.vote) ||
                    (missing.result && !rename.result)
                  }
                  onClick={handleCreateMissingChannels}
                >
                  Créer les salons manquants
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageIntegrations;
