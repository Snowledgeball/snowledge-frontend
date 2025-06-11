import React, { useEffect, useState } from "react";
import { useListChannels } from "./hooks/useListChannels";
import { useCreateChannels } from "./hooks/useCreateChannels";
import { useRenameChannels } from "./hooks/useRenameChannels";
import { useDiscordServer } from "./hooks/useDiscordServer";
import { useUpdateDiscordServer } from "./hooks/useUpdateDiscordServer";
import { Channel, ChannelNames } from "./types";
import { ChannelSelect } from "./components/ChannelSelect";
import { Feedback } from "./components/Feedback";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/alert";
import { SparklesIcon, PlusCircleIcon, ShieldAlertIcon } from "lucide-react";
// shadcn/ui
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";

interface Props {
  communityId: number;
}

export const ManageIntegrations: React.FC<Props> = ({ communityId }) => {
  // États pour le mode création ou renommage
  const [proposeName, setProposeName] = useState("propositions");
  const [voteName, setVoteName] = useState("votes");
  const [resultName, setResultName] = useState("résultats");
  const [renamePropose, setRenamePropose] = useState("");
  const [renameVote, setRenameVote] = useState("");
  const [renameResult, setRenameResult] = useState("");

  // Query pour récupérer le mapping DiscordServer d'une communauté
  const {
    data: discordServerData,
    isLoading: isLoadingDiscordServer,
    isError: isErrorDiscordServer,
    error: errorDiscordServer,
    refetch: refetchDiscordServer,
  } = useDiscordServer(communityId);

  // Query pour lister les channels (on attend d'avoir le guildId du mapping DiscordServer)
  const {
    data: listData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
    refetch: refetchList,
  } = useListChannels(discordServerData?.discordGuildId || "");

  // Mutation pour créer les channels
  const {
    mutate: createChannels,
    isPending: isLoadingCreate,
    isError: isErrorCreate,
    error: errorCreate,
    data: createData,
    reset: resetCreate,
  } = useCreateChannels();

  // Mutation pour renommer les channels
  const {
    mutate: renameChannels,
    isPending: isLoadingRename,
    isError: isErrorRename,
    error: errorRename,
    data: renameData,
    reset: resetRename,
  } = useRenameChannels();

  // Mutation pour mettre à jour le mapping DiscordServer
  const {
    mutate: updateDiscordServer,
    isPending: isLoadingUpdateDiscordServer,
    isError: isErrorUpdateDiscordServer,
    error: errorUpdateDiscordServer,
  } = useUpdateDiscordServer();

  // Détection du mode création initiale
  const allIdsNull =
    discordServerData &&
    !discordServerData.proposeChannelId &&
    !discordServerData.voteChannelId &&
    !discordServerData.resultChannelId;

  // Utilitaire pour retrouver le nom d'un salon par son id
  const getChannelName = (id?: string) =>
    listData?.channels.find((ch: Channel) => ch.id === id)?.name || "";

  const proposeExists = !!getChannelName(discordServerData?.proposeChannelId);
  const voteExists = !!getChannelName(discordServerData?.voteChannelId);
  const resultExists = !!getChannelName(discordServerData?.resultChannelId);

  // Création d'un seul salon manquant
  const handleCreateSingleChannel = (type: "propose" | "vote" | "result") => {
    if (!discordServerData?.discordGuildId) return;
    let name = "";
    if (type === "propose") name = renamePropose || "propositions";
    if (type === "vote") name = renameVote || "votes";
    if (type === "result") name = renameResult || "résultats";
    if (!name) {
      toast.error("Merci de renseigner un nom pour le salon.");
      return;
    }
    createChannels(
      {
        guildId: discordServerData.discordGuildId,
        proposeName:
          type === "propose"
            ? name
            : getChannelName(discordServerData?.proposeChannelId) ||
              "propositions",
        voteName:
          type === "vote"
            ? name
            : getChannelName(discordServerData?.voteChannelId) || "votes",
        resultName:
          type === "result"
            ? name
            : getChannelName(discordServerData?.resultChannelId) || "résultats",
      },
      {
        onSuccess: async () => {
          const listResult = await refetchList();
          const discordServerResult = await refetchDiscordServer();
          const getId = (name: string) =>
            listResult.data?.channels.find((ch: Channel) => ch.name === name)
              ?.id;
          updateDiscordServer({
            id: discordServerResult.data.id,
            proposeChannelId: getId(name),
            voteChannelId: getId(name),
            resultChannelId: getId(name),
          });
          toast.success("Salon créé avec succès !");
        },
        onError: (error) => {
          toast.error(
            error?.message || "Erreur lors de la création du salon Discord."
          );
        },
      }
    );
  };

  // Création des channels en 1 clic
  const handleCreateAllChannels = () => {
    if (!discordServerData?.discordGuildId) return;
    if (!proposeName || !voteName || !resultName) {
      const missing = [];
      if (!proposeName) missing.push("propositions");
      if (!voteName) missing.push("votes");
      if (!resultName) missing.push("résultats");
      toast.error(
        `Merci de renseigner le(s) nom(s) de channel pour : ${missing.join(", ")}.`
      );
      return;
    }
    createChannels(
      {
        guildId: discordServerData.discordGuildId,
        proposeName,
        voteName,
        resultName,
      },
      {
        onSuccess: async () => {
          const listResult = await refetchList();
          const discordServerResult = await refetchDiscordServer();
          const getId = (name: string) =>
            listResult.data?.channels.find((ch: Channel) => ch.name === name)
              ?.id;
          updateDiscordServer({
            id: discordServerResult.data.id,
            proposeChannelId: getId(proposeName),
            voteChannelId: getId(voteName),
            resultChannelId: getId(resultName),
          });
          toast.success("Salons créés avec succès !");
        },
        onError: (error) => {
          toast.error(
            error?.message || "Erreur lors de la création des salons Discord."
          );
        },
      }
    );
  };

  // Renommage d'un channel
  const handleRename = (type: "propose" | "vote" | "result") => {
    if (!discordServerData?.discordGuildId) return;
    const oldNames = {
      propose:
        listData?.channels.find(
          (ch: Channel) => ch.id === discordServerData.proposeChannelId
        )?.name || "",
      vote:
        listData?.channels.find(
          (ch: Channel) => ch.id === discordServerData.voteChannelId
        )?.name || "",
      result:
        listData?.channels.find(
          (ch: Channel) => ch.id === discordServerData.resultChannelId
        )?.name || "",
    };
    const newNames = { ...oldNames };
    if (type === "propose") newNames.propose = renamePropose;
    if (type === "vote") newNames.vote = renameVote;
    if (type === "result") newNames.result = renameResult;
    renameChannels(
      {
        guildId: discordServerData.discordGuildId,
        oldNames,
        newNames,
      },
      {
        onSuccess: async () => {
          const listResult = await refetchList();
          const discordServerResult = await refetchDiscordServer();
          const getId = (name: string) =>
            listResult.data?.channels.find((ch: Channel) => ch.name === name)
              ?.id;
          updateDiscordServer({
            id: discordServerResult.data.id,
            proposeChannelId: getId(newNames.propose),
            voteChannelId: getId(newNames.vote),
            resultChannelId: getId(newNames.result),
          });
          toast.success("Salon renommé avec succès !");
          // Nettoie l'input après renommage
          if (type === "propose") setRenamePropose("");
          if (type === "vote") setRenameVote("");
          if (type === "result") setRenameResult("");
        },
        onError: (error) => {
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
        {allIdsNull ? (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>
                Première configuration des channels Discord
              </AlertTitle>
              <AlertDescription>
                Aucun channel n'est encore affecté pour les propositions, votes
                ou résultats.
                <br />
                Veuillez choisir un nom pour chaque salon, puis cliquez sur
                "Créer les salons".
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <div>
                <label>Nom du salon propositions</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={proposeName}
                  onChange={(e) => setProposeName(e.target.value)}
                  placeholder="propositions"
                />
              </div>
              <div>
                <label>Nom du salon votes</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={voteName}
                  onChange={(e) => setVoteName(e.target.value)}
                  placeholder="votes"
                />
              </div>
              <div>
                <label>Nom du salon résultats</label>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={resultName}
                  onChange={(e) => setResultName(e.target.value)}
                  placeholder="résultats"
                />
              </div>
              <Button
                className="w-full mt-2"
                onClick={handleCreateAllChannels}
                disabled={isLoadingCreate}
              >
                Créer les salons
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert variant="default" className="mb-4">
              <AlertTitle>Salons Discord assignés</AlertTitle>
              <AlertDescription>
                Vous pouvez renommer chaque salon si besoin.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <div>
                <label>Salon propositions</label>
                {!proposeExists ? (
                  <>
                    <Alert variant="destructive" className="mb-2">
                      <AlertTitle>Salon manquant</AlertTitle>
                      <AlertDescription>
                        Le salon assigné pour les propositions n'existe plus sur
                        Discord.
                        <br />
                        Veuillez en créer un nouveau.
                      </AlertDescription>
                    </Alert>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renamePropose}
                      onChange={(e) => setRenamePropose(e.target.value)}
                      placeholder="propositions"
                    />
                    <Button
                      className="mt-1"
                      onClick={() => handleCreateSingleChannel("propose")}
                      disabled={isLoadingCreate || !renamePropose}
                    >
                      Créer ce salon
                    </Button>
                  </>
                ) : (
                  <>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renamePropose}
                      onChange={(e) => setRenamePropose(e.target.value)}
                      placeholder={getChannelName(
                        discordServerData?.proposeChannelId
                      )}
                    />
                    <Button
                      className="mt-1"
                      onClick={() => handleRename("propose")}
                      disabled={isLoadingRename || !renamePropose}
                    >
                      Renommer
                    </Button>
                  </>
                )}
              </div>
              <div>
                <label>Salon votes</label>
                {!voteExists ? (
                  <>
                    <Alert variant="destructive" className="mb-2">
                      <AlertTitle>Salon manquant</AlertTitle>
                      <AlertDescription>
                        Le salon assigné pour les votes n'existe plus sur
                        Discord.
                        <br />
                        Veuillez en créer un nouveau.
                      </AlertDescription>
                    </Alert>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renameVote}
                      onChange={(e) => setRenameVote(e.target.value)}
                      placeholder="votes"
                    />
                    <Button
                      className="mt-1"
                      onClick={() => handleCreateSingleChannel("vote")}
                      disabled={isLoadingCreate || !renameVote}
                    >
                      Créer ce salon
                    </Button>
                  </>
                ) : (
                  <>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renameVote}
                      onChange={(e) => setRenameVote(e.target.value)}
                      placeholder={getChannelName(
                        discordServerData?.voteChannelId
                      )}
                    />
                    <Button
                      className="mt-1"
                      onClick={() => handleRename("vote")}
                      disabled={isLoadingRename || !renameVote}
                    >
                      Renommer
                    </Button>
                  </>
                )}
              </div>
              <div>
                <label>Salon résultats</label>
                {!resultExists ? (
                  <>
                    <Alert variant="destructive" className="mb-2">
                      <AlertTitle>Salon manquant</AlertTitle>
                      <AlertDescription>
                        Le salon assigné pour les résultats n'existe plus sur
                        Discord.
                        <br />
                        Veuillez en créer un nouveau.
                      </AlertDescription>
                    </Alert>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renameResult}
                      onChange={(e) => setRenameResult(e.target.value)}
                      placeholder="résultats"
                    />
                    <Button
                      className="mt-1"
                      onClick={() => handleCreateSingleChannel("result")}
                      disabled={isLoadingCreate || !renameResult}
                    >
                      Créer ce salon
                    </Button>
                  </>
                ) : (
                  <>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renameResult}
                      onChange={(e) => setRenameResult(e.target.value)}
                      placeholder={getChannelName(
                        discordServerData?.resultChannelId
                      )}
                    />
                    <Button
                      className="mt-1"
                      onClick={() => handleRename("result")}
                      disabled={isLoadingRename || !renameResult}
                    >
                      Renommer
                    </Button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        {/* TODO: inutile pour le moment, à rajouter si demande
        <ChannelSelect ... />
        <Feedback ... />
        Autres fonctionnalités de sélection/affectation
        */}
      </CardContent>
    </Card>
  );
};

export default ManageIntegrations;
