import React from "react";

interface FeedbackProps {
  isErrorList?: boolean;
  errorList?: unknown;
  isErrorCreate?: boolean;
  errorCreate?: unknown;
  isErrorRename?: boolean;
  errorRename?: unknown;
  createData?: any;
  renameData?: any;
  isErrorDiscordServer?: boolean;
  errorDiscordServer?: unknown;
  isErrorUpdateDiscordServer?: boolean;
  errorUpdateDiscordServer?: unknown;
  discordServerData?: any;
}

export const Feedback: React.FC<FeedbackProps> = (props) => (
  <>
    {props.isErrorList && (
      <div className="mt-4 text-red-700">
        {(props.errorList as Error)?.message ||
          "Erreur lors du chargement des channels Discord"}
      </div>
    )}
    {props.isErrorCreate && (
      <div className="mt-4 text-red-700">
        {(props.errorCreate as Error)?.message ||
          "Erreur lors de la création des channels Discord"}
      </div>
    )}
    {props.isErrorRename && (
      <div className="mt-4 text-red-700">
        {(props.errorRename as Error)?.message ||
          "Erreur lors du renommage des channels Discord"}
      </div>
    )}
    {props.createData && !props.createData.error && (
      <div className="mt-4 text-green-700">
        Channels créés: {props.createData.created?.join(", ") || "aucun"}. Déjà
        existants: {props.createData.existing?.join(", ") || "aucun"}
      </div>
    )}
    {props.renameData && !props.renameData.error && (
      <div className="mt-4 text-green-700">
        {props.renameData.results
          ? props.renameData.results
              .map((r: any) => `${r.old} → ${r.new} : ${r.status}`)
              .join(" | ")
          : "Renommage effectué"}
      </div>
    )}
    {(props.createData?.error || props.renameData?.error) && (
      <div className="mt-4 text-red-700">
        {props.createData?.error || props.renameData?.error}
      </div>
    )}
    {props.isErrorDiscordServer && (
      <div className="mt-4 text-red-700">
        {(props.errorDiscordServer as Error)?.message ||
          "Erreur lors de la récupération du mapping DiscordServer"}
      </div>
    )}
    {props.isErrorUpdateDiscordServer && (
      <div className="mt-4 text-red-700">
        {(props.errorUpdateDiscordServer as Error)?.message ||
          "Erreur lors de la mise à jour du mapping DiscordServer"}
      </div>
    )}
    {props.discordServerData && !props.discordServerData.error && (
      <div className="mt-4 text-green-700">
        Mapping DiscordServer: {props.discordServerData.discordGuildId}
      </div>
    )}
    {(props.discordServerData?.error || props.errorUpdateDiscordServer) && (
      <div className="mt-4 text-red-700">
        {props.discordServerData?.error || props.errorUpdateDiscordServer}
      </div>
    )}
  </>
);
