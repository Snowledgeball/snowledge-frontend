import React from "react";
import { AlertInfo } from "./AlertInfo";

export const FirstConfigAlert: React.FC = () => (
  <AlertInfo
    variant="destructive"
    title="Première configuration des channels Discord"
    description={
      <>
        Aucun channel n'est encore affecté pour les propositions, votes ou
        résultats.
        <br />
        Veuillez choisir un nom pour chaque salon, puis cliquez sur "Créer les
        salons".
      </>
    }
    className="mb-4"
  />
);

export default FirstConfigAlert;
