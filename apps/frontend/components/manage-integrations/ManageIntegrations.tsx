import React, { useEffect, useState } from "react";
import { useListChannels } from "./hooks/useListChannels";
import { useCreateChannels } from "./hooks/useCreateChannels";
import { useRenameChannels } from "./hooks/useRenameChannels";
import { useDiscordServer } from "./hooks/useDiscordServer";
import { useUpdateDiscordServer } from "./hooks/useUpdateDiscordServer";
import { Channel, ChannelNames } from "./types";
import { ChannelSelect } from "./components/ChannelSelect";
import { Feedback } from "./components/Feedback";
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
          const newList = await refetchList();
          const channelsList = newList.data?.channels || [];
          const getId = (name: string) =>
            channelsList.find((ch: Channel) => ch.name === name)?.id ||
            undefined;
          updateDiscordServer({
            id: discordServerData.id,
            proposeChannelId: getId(proposeName),
            voteChannelId: getId(voteName),
            resultChannelId: getId(resultName),
          });
          if (proposeMode === "new") {
            setChannels((c) => ({ ...c, propose: proposeName }));
            setProposeMode("select");
            setNewPropose("");
          }
          if (voteMode === "new") {
            setChannels((c) => ({ ...c, vote: voteName }));
            setVoteMode("select");
            setNewVote("");
          }
          if (resultMode === "new") {
            setChannels((c) => ({ ...c, result: resultName }));
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

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Gestion des channels Discord</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <Button
            className="flex-1"
            onClick={handleCreateChannels}
            disabled={loading}
            variant="default"
          >
            Créer les channels
          </Button>
          <Button
            className="flex-1"
            onClick={handleRenameChannels}
            disabled={loading}
            variant="secondary"
          >
            Renommer les channels
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
