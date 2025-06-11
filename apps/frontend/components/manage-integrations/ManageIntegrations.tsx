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

interface Props {
  communityId: number;
}

export const ManageIntegrations: React.FC<Props> = ({ communityId }) => {
  // États pour le mode de sélection (select ou création)
  const [proposeMode, setProposeMode] = useState<"select" | "new">("select");
  const [voteMode, setVoteMode] = useState<"select" | "new">("select");
  const [resultMode, setResultMode] = useState<"select" | "new">("select");
  const [newPropose, setNewPropose] = useState("");
  const [newVote, setNewVote] = useState("");
  const [newResult, setNewResult] = useState("");
  const [channels, setChannels] = useState<ChannelNames>({
    propose: "",
    vote: "",
    result: "",
  });
  const [oldChannels, setOldChannels] = useState<ChannelNames>(channels);

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

  // Met à jour les champs à partir des données récupérées
  useEffect(() => {
    if (
      listData &&
      listData.channels &&
      discordServerData &&
      (discordServerData.proposeChannelId ||
        discordServerData.voteChannelId ||
        discordServerData.resultChannelId)
    ) {
      // On pré-sélectionne les channels par leur ID stocké en base
      const getName = (id?: string) =>
        listData.channels.find((ch: Channel) => ch.id === id)?.name || "";
      setChannels({
        propose: getName(discordServerData.proposeChannelId),
        vote: getName(discordServerData.voteChannelId),
        result: getName(discordServerData.resultChannelId),
      });
      setOldChannels({
        propose: getName(discordServerData.proposeChannelId),
        vote: getName(discordServerData.voteChannelId),
        result: getName(discordServerData.resultChannelId),
      });
    } else if (
      listData &&
      listData.channels &&
      !channels.propose &&
      !channels.vote &&
      !channels.result
    ) {
      setChannels({
        propose: listData.channels[0]?.name || "",
        vote: listData.channels[1]?.name || "",
        result: listData.channels[2]?.name || "",
      });
      setOldChannels({
        propose: listData.channels[0]?.name || "",
        vote: listData.channels[1]?.name || "",
        result: listData.channels[2]?.name || "",
      });
    }
    // eslint-disable-next-line
  }, [listData, discordServerData]);

  // Création des channels si besoin
  const handleCreateChannels = () => {
    resetCreate();
    const proposeName = proposeMode === "new" ? newPropose : channels.propose;
    const voteName = voteMode === "new" ? newVote : channels.vote;
    const resultName = resultMode === "new" ? newResult : channels.result;
    if (!discordServerData?.discordGuildId) return;
    createChannels(
      {
        guildId: discordServerData.discordGuildId,
        proposeName,
        voteName,
        resultName,
      },
      {
        onSuccess: async () => {
          await refetchList();
          await refetchDiscordServer();
          // Repasse en mode select et reset les inputs
          if (proposeMode === "new") {
            setProposeMode("select");
            setNewPropose("");
          }
          if (voteMode === "new") {
            setVoteMode("select");
            setNewVote("");
          }
          if (resultMode === "new") {
            setResultMode("select");
            setNewResult("");
          }
        },
      }
    );
  };

  // Renommage des channels
  const handleRenameChannels = () => {
    resetRename();
    if (!discordServerData?.discordGuildId) return;
    renameChannels(
      {
        guildId: discordServerData.discordGuildId,
        oldNames: oldChannels,
        newNames: channels,
      },
      {
        onSuccess: async () => {
          setOldChannels({ ...channels });
          await refetchList();
          // Synchronisation du mapping DiscordServer en base
          if (listData?.channels) {
            const getId = (name: string) =>
              listData.channels.find((ch: Channel) => ch.name === name)?.id ||
              undefined;
            updateDiscordServer({
              id: discordServerData.id,
              proposeChannelId: getId(channels.propose),
              voteChannelId: getId(channels.vote),
              resultChannelId: getId(channels.result),
            });
          }
        },
      }
    );
  };

  // Fonction pour renommer un seul channel
  const handleRenameSingleChannel =
    (type: "propose" | "vote" | "result") =>
    (oldName: string, newName: string) => {
      if (!discordServerData?.discordGuildId) return;
      const oldNames = { ...channels };
      const newNames = { ...channels };
      oldNames[type] = oldName;
      newNames[type] = newName;
      renameChannels(
        {
          guildId: discordServerData.discordGuildId,
          oldNames,
          newNames,
        },
        {
          onSuccess: async () => {
            await refetchList();
          },
        }
      );
      // Met à jour la sélection localement
      setChannels((c) => ({ ...c, [type]: newName }));
      setOldChannels((c) => ({ ...c, [type]: newName }));
    };

  // Gestion des selects et inputs
  const handleSelect = (type: "propose" | "vote" | "result", value: string) => {
    if (value === "__new__") {
      if (type === "propose") setProposeMode("new");
      if (type === "vote") setVoteMode("new");
      if (type === "result") setResultMode("new");
    } else {
      setChannels((c) => ({ ...c, [type]: value }));
      if (type === "propose") setProposeMode("select");
      if (type === "vote") setVoteMode("select");
      if (type === "result") setResultMode("select");
    }
  };

  const loading =
    isLoadingList ||
    isLoadingCreate ||
    isLoadingRename ||
    isLoadingDiscordServer ||
    isLoadingUpdateDiscordServer;

  // Vérifie si on est en mode création pour au moins un channel
  const isCreating =
    proposeMode === "new" || voteMode === "new" || resultMode === "new";
  // Vérifie si une modification a été faite sur la sélection
  const hasChanged =
    channels.propose !== oldChannels.propose ||
    channels.vote !== oldChannels.vote ||
    channels.result !== oldChannels.result;

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Gestion des channels Discord</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="mb-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-1">
            <SparklesIcon className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-900">
              Bienvenue dans la gestion des channels Discord !
            </AlertTitle>
          </div>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-2 mt-2 text-blue-900">
              <li>
                <span className="font-semibold">
                  🔄 Récupération automatique :
                </span>{" "}
                Les channels affichés sont ceux déjà existants sur votre serveur
                Discord.
              </li>
              <li>
                <span className="font-semibold">
                  <PlusCircleIcon className="inline h-4 w-4 mb-1 text-green-600" />{" "}
                  Création facilitée :
                </span>{" "}
                Créez de nouveaux channels directement depuis cette interface.
              </li>
              <li>
                <span className="font-semibold">
                  <ShieldAlertIcon className="inline h-4 w-4 mb-1 text-yellow-500" />{" "}
                  Important :
                </span>{" "}
                <b>Ne renommez pas</b> ces channels sur Discord, faites-le
                uniquement ici pour garantir la synchronisation.
              </li>
              <li>
                <span className="font-semibold">📁 Un channel par usage :</span>{" "}
                <b>Propositions</b>, <b>votes</b> et <b>résultats</b> doivent
                chacun avoir leur propre channel pour éviter tout conflit.
              </li>
              <li>
                <span className="font-semibold">
                  ✨ Synchronisation instantanée :
                </span>{" "}
                Toute modification ici est automatiquement appliquée sur Discord{" "}
                <b>et</b> dans la base de données.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
        <ChannelSelect
          label="Channel propositions"
          mode={proposeMode}
          value={channels.propose}
          onModeChange={setProposeMode}
          onValueChange={(v) => setChannels((c) => ({ ...c, propose: v }))}
          channels={listData?.channels || []}
          newValue={newPropose}
          setNewValue={setNewPropose}
          loading={loading}
          onRename={handleRenameSingleChannel("propose")}
        />
        <ChannelSelect
          label="Channel votes"
          mode={voteMode}
          value={channels.vote}
          onModeChange={setVoteMode}
          onValueChange={(v) => setChannels((c) => ({ ...c, vote: v }))}
          channels={listData?.channels || []}
          newValue={newVote}
          setNewValue={setNewVote}
          loading={loading}
          onRename={handleRenameSingleChannel("vote")}
        />
        <ChannelSelect
          label="Channel résultats"
          mode={resultMode}
          value={channels.result}
          onModeChange={setResultMode}
          onValueChange={(v) => setChannels((c) => ({ ...c, result: v }))}
          channels={listData?.channels || []}
          newValue={newResult}
          setNewValue={setNewResult}
          loading={loading}
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex gap-2 w-full">
          {isCreating && (
            <Button
              className="flex-1"
              onClick={handleCreateChannels}
              disabled={loading}
              variant="default"
            >
              Créer le salon
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={handleRenameChannels}
            disabled={loading || !hasChanged}
            variant="secondary"
          >
            Appliquer les modifications
          </Button>
        </div>
        <Feedback
          isErrorList={isErrorList}
          errorList={errorList}
          isErrorCreate={isErrorCreate}
          errorCreate={errorCreate}
          isErrorRename={isErrorRename}
          errorRename={errorRename}
          createData={createData}
          renameData={renameData}
          isErrorDiscordServer={isErrorDiscordServer}
          errorDiscordServer={errorDiscordServer}
          isErrorUpdateDiscordServer={isErrorUpdateDiscordServer}
          errorUpdateDiscordServer={errorUpdateDiscordServer}
          discordServerData={discordServerData}
        />
      </CardFooter>
    </Card>
  );
};

export default ManageIntegrations;
