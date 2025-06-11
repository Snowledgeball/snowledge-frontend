import React, { useState } from "react";
import { useListChannels } from "./hooks/useListChannels";
import { useCreateChannels } from "./hooks/useCreateChannels";
import { useRenameChannels } from "./hooks/useRenameChannels";
import { useDiscordServer } from "./hooks/useDiscordServer";
import { useUpdateDiscordServer } from "./hooks/useUpdateDiscordServer";
import { Channel } from "./types";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/alert";
import { CheckIcon } from "lucide-react";
// shadcn/ui
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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

  // Création des channels en 1 clic (adapte pour ne créer que les salons manquants)
  const handleCreateMissingChannels = () => {
    if (!discordServerData?.discordGuildId) return;
    // On ne crée que les salons manquants
    const missing: { [key: string]: string } = {};
    if (!proposeExists) missing.proposeName = renamePropose;
    if (!voteExists) missing.voteName = renameVote;
    if (!resultExists) missing.resultName = renameResult;
    // Vérifie que tous les champs nécessaires sont remplis
    const missingFields = Object.entries(missing).filter(([, v]) => !v);
    if (missingFields.length > 0) {
      toast.error("Merci de renseigner un nom pour chaque salon manquant.");
      return;
    }
    createChannels(
      {
        guildId: discordServerData.discordGuildId,
        proposeName: proposeExists ? "" : renamePropose,
        voteName: voteExists ? "" : renameVote,
        resultName: resultExists ? "" : renameResult,
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
            proposeChannelId: proposeExists
              ? discordServerData.proposeChannelId
              : getId(renamePropose),
            voteChannelId: voteExists
              ? discordServerData.voteChannelId
              : getId(renameVote),
            resultChannelId: resultExists
              ? discordServerData.resultChannelId
              : getId(renameResult),
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

    // Timer pour afficher un toast si ça prend plus de 5 secondes
    let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
      toast.warning(
        "Le renommage prend plus de 5 secondes. Vous avez probablement atteint la limite Discord (2 renommages toutes les 10 minutes). Veuillez patienter 10 minutes ou renommer le salon directement sur Discord.",
        {
          duration: 20000,
        }
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
        <Alert variant="default" className="mb-4">
          <AlertTitle>Limitation Discord</AlertTitle>
          <AlertDescription>
            Sur cette plateforme, un nom de salon Discord n'est modifiable que{" "}
            <b>deux fois toutes les 10 minutes.</b>
            <br />
            Si vous devez le modifier plus rapidement, vous pouvez le faire
            directement depuis Discord.
          </AlertDescription>
        </Alert>
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
                style={{
                  cursor:
                    !proposeName || !voteName || !resultName
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={
                  isLoadingCreate || !proposeName || !voteName || !resultName
                }
                onClick={() => {
                  if (!proposeName || !voteName || !resultName) {
                    toast.error(
                      "Merci de renseigner un nom pour chaque salon."
                    );
                    return;
                  }
                  handleCreateMissingChannels();
                }}
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
                    <div className="flex items-center gap-2">
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={renamePropose}
                        onChange={(e) => setRenamePropose(e.target.value)}
                        placeholder="propositions"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renamePropose}
                      onChange={(e) => setRenamePropose(e.target.value)}
                      placeholder={getChannelName(
                        discordServerData?.proposeChannelId
                      )}
                    />
                    {!!renamePropose && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRename("propose")}
                        disabled={isLoadingRename || !renamePropose}
                        aria-label="Valider le renommage"
                      >
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
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
                    <div className="flex items-center gap-2">
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={renameVote}
                        onChange={(e) => setRenameVote(e.target.value)}
                        placeholder="votes"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renameVote}
                      onChange={(e) => setRenameVote(e.target.value)}
                      placeholder={getChannelName(
                        discordServerData?.voteChannelId
                      )}
                    />
                    {!!renameVote && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRename("vote")}
                        disabled={isLoadingRename || !renameVote}
                        aria-label="Valider le renommage"
                      >
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
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
                    <div className="flex items-center gap-2">
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={renameResult}
                        onChange={(e) => setRenameResult(e.target.value)}
                        placeholder="résultats"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={renameResult}
                      onChange={(e) => setRenameResult(e.target.value)}
                      placeholder={getChannelName(
                        discordServerData?.resultChannelId
                      )}
                    />
                    {!!renameResult && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRename("result")}
                        disabled={isLoadingRename || !renameResult}
                        aria-label="Valider le renommage"
                      >
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Affiche le bouton de création si au moins un salon est manquant */}
            {(!proposeExists || !voteExists || !resultExists) && (
              <Button
                className="w-full mt-2"
                disabled={
                  isLoadingCreate ||
                  (!proposeExists && !renamePropose) ||
                  (!voteExists && !renameVote) ||
                  (!resultExists && !renameResult)
                }
                onClick={handleCreateMissingChannels}
              >
                Créer les salons manquants
              </Button>
            )}
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
