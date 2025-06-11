import React from "react";
import { AlertInfo } from "./AlertInfo";

export const DiscordLimitationAlert: React.FC = () => (
  <AlertInfo
    title="Limitation Discord"
    description={
      <span>
        Chaque salon Discord peut être renommé jusqu'à{" "}
        <strong>2 fois toutes les 10 minutes</strong>, indépendamment des autres
        salons.
        <br />
        <br />
        <i>
          Si besoin, vous pouvez toujours renommer les salons directement depuis
          Discord.
        </i>
      </span>
    }
    className="mb-4"
  />
);

export default DiscordLimitationAlert;
