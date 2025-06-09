import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

interface Props {
  guildId: string;
}

interface Channel {
  id: string;
  name: string;
}

interface ChannelNames {
  propose: string;
  vote: string;
  result: string;
}

// Utilitaire pour l'URL de l'API backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Hook pour lister les channels Discord
function useListChannels(guildId: string) {
  return useQuery({
    queryKey: ["discord-channels", guildId],
    queryFn: async () => {
      const res = await fetcher(
        `${API_URL}/discord-bot/list-channels?guildId=${encodeURIComponent(guildId)}`
      );
      return res;
    },
    enabled: !!guildId,
  });
}

// Hook pour créer les channels
function useCreateChannels() {
  return useMutation({
    mutationFn: async (params: {
      guildId: string;
      proposeName: string;
      voteName: string;
      resultName: string;
    }) => {
      return await fetcher(`${API_URL}/discord-bot/create-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
    },
  });
}

// Hook pour renommer les channels
function useRenameChannels() {
  return useMutation({
    mutationFn: async (params: {
      guildId: string;
      oldNames: ChannelNames;
      newNames: ChannelNames;
    }) => {
      return await fetcher(`${API_URL}/discord-bot/rename-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
    },
  });
}

export const ManageIntegrations: React.FC<Props> = ({ guildId }) => {
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

  // Query pour lister les channels
  const {
    data: listData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
    refetch: refetchList,
  } = useListChannels(guildId);

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

  // Met à jour les champs à partir des données récupérées
  useEffect(() => {
    if (
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
    // Sinon, on ne touche pas à la sélection utilisateur !
    // eslint-disable-next-line
  }, [listData]);

  // Création des channels si besoin
  const handleCreateChannels = () => {
    resetCreate();
    // On prend le nom saisi si mode 'new', sinon la valeur du select
    const proposeName = proposeMode === "new" ? newPropose : channels.propose;
    const voteName = voteMode === "new" ? newVote : channels.vote;
    const resultName = resultMode === "new" ? newResult : channels.result;
    createChannels(
      {
        guildId,
        proposeName,
        voteName,
        resultName,
      },
      {
        onSuccess: () => {
          refetchList();
          // Après création, repasse en mode select et sélectionne le nouveau salon
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
    renameChannels(
      {
        guildId,
        oldNames: oldChannels,
        newNames: channels,
      },
      {
        onSuccess: () => {
          setOldChannels({ ...channels });
          refetchList();
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

  const loading = isLoadingList || isLoadingCreate || isLoadingRename;

  return (
    <div className="max-w-xl mx-auto p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-bold mb-4">Gestion des channels Discord</h2>
      <div className="space-y-3">
        {/* Propose */}
        <div>
          <label className="block font-medium">Channel propositions</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={proposeMode === "new" ? "__new__" : channels.propose}
            onChange={(e) => handleSelect("propose", e.target.value)}
            disabled={loading}
          >
            {listData?.channels.map((ch: Channel) => (
              <option key={ch.id} value={ch.name}>
                {ch.name}
              </option>
            ))}
            <option value="__new__">Créer un nouveau salon...</option>
          </select>
          {proposeMode === "new" && (
            <input
              className="border rounded px-2 py-1 w-full mt-2"
              placeholder="Nom du nouveau salon"
              value={newPropose}
              onChange={(e) => setNewPropose(e.target.value)}
              disabled={loading}
            />
          )}
        </div>
        {/* Vote */}
        <div>
          <label className="block font-medium">Channel votes</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={voteMode === "new" ? "__new__" : channels.vote}
            onChange={(e) => handleSelect("vote", e.target.value)}
            disabled={loading}
          >
            {listData?.channels.map((ch: Channel) => (
              <option key={ch.id} value={ch.name}>
                {ch.name}
              </option>
            ))}
            <option value="__new__">Créer un nouveau salon...</option>
          </select>
          {voteMode === "new" && (
            <input
              className="border rounded px-2 py-1 w-full mt-2"
              placeholder="Nom du nouveau salon"
              value={newVote}
              onChange={(e) => setNewVote(e.target.value)}
              disabled={loading}
            />
          )}
        </div>
        {/* Result */}
        <div>
          <label className="block font-medium">Channel résultats</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={resultMode === "new" ? "__new__" : channels.result}
            onChange={(e) => handleSelect("result", e.target.value)}
            disabled={loading}
          >
            {listData?.channels.map((ch: Channel) => (
              <option key={ch.id} value={ch.name}>
                {ch.name}
              </option>
            ))}
            <option value="__new__">Créer un nouveau salon...</option>
          </select>
          {resultMode === "new" && (
            <input
              className="border rounded px-2 py-1 w-full mt-2"
              placeholder="Nom du nouveau salon"
              value={newResult}
              onChange={(e) => setNewResult(e.target.value)}
              disabled={loading}
            />
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleCreateChannels}
          disabled={loading}
        >
          Créer les channels
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleRenameChannels}
          disabled={loading}
        >
          Renommer les channels
        </button>
      </div>
      {/* Feedback utilisateur */}
      {isErrorList && (
        <div className="mt-4 text-red-700">
          {(errorList as Error)?.message ||
            "Erreur lors du chargement des channels Discord"}
        </div>
      )}
      {isErrorCreate && (
        <div className="mt-4 text-red-700">
          {(errorCreate as Error)?.message ||
            "Erreur lors de la création des channels Discord"}
        </div>
      )}
      {isErrorRename && (
        <div className="mt-4 text-red-700">
          {(errorRename as Error)?.message ||
            "Erreur lors du renommage des channels Discord"}
        </div>
      )}
      {createData && !createData.error && (
        <div className="mt-4 text-green-700">
          Channels créés: {createData.created?.join(", ") || "aucun"}. Déjà
          existants: {createData.existing?.join(", ") || "aucun"}
        </div>
      )}
      {renameData && !renameData.error && (
        <div className="mt-4 text-green-700">
          {renameData.results
            ? renameData.results
                .map((r: any) => `${r.old} → ${r.new} : ${r.status}`)
                .join(" | ")
            : "Renommage effectué"}
        </div>
      )}
      {(createData?.error || renameData?.error) && (
        <div className="mt-4 text-red-700">
          {createData?.error || renameData?.error}
        </div>
      )}
    </div>
  );
};

export default ManageIntegrations;
