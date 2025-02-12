"use client";

import React, { useState } from "react";
import {
  generateStarkNetAddress,
  deployAccountContract,
} from "../../utils/starknetUtils";

interface AddressDetails {
  privateKey: string;
  publicKey: string;
  accountAddress: string;
}

interface DeploymentResult {
  transactionHash?: string;
  accountAddress?: string;
}

const GenerateAddress = () => {
  const [addressDetails, setAddressDetails] = useState<AddressDetails | null>(
    null
  );
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  const handleGenerateAddress = () => {
    try {
      console.log("generateStarkNetAddress");
      const details = generateStarkNetAddress();
      console.log("details", details);
      setAddressDetails(details as AddressDetails);
      setDeployStatus(null);
    } catch (error: unknown) {
      console.log("error", error);
      if (error instanceof Error) {
        setDeployStatus(`Erreur : ${error.message}`);
      } else {
        setDeployStatus("Une erreur inconnue s'est produite");
      }
    }
  };

  const handleDeployContract = async () => {
    if (!addressDetails) return;

    try {
      setDeployStatus("Déploiement en cours...");
      const result = await deployAccountContract(
        addressDetails.privateKey,
        addressDetails.publicKey
      ) as DeploymentResult;
      console.log("result", result);
      setDeployStatus(
        `Contrat déployé avec succès ! Transaction hash : ${result.transactionHash}`
      );
    } catch (error: unknown) {
      console.log("error", error);
      if (error instanceof Error) {
        setDeployStatus(`Erreur : ${error.message}`);
      } else {
        setDeployStatus("Une erreur inconnue s'est produite");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-xl font-bold text-gray-800 text-center mb-4">
        Générateur et Déployeur d&apos;Adresse StarkNet
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Cliquez sur le bouton ci-dessous pour générer une adresse, ajoutez des
        fonds, puis déployez le contrat.
      </p>
      <button
        onClick={handleGenerateAddress}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Générer une Adresse
      </button>
      {addressDetails && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">Adresse :</p>
          <p className="text-gray-800 font-mono break-all">
            {addressDetails.accountAddress}
          </p>
          <p className="text-sm text-gray-500 mt-4">Clé Publique :</p>
          <p className="text-gray-800 font-mono break-all">
            {addressDetails.publicKey}
          </p>
          <p className="text-sm text-gray-500 mt-4">Clé Privée :</p>
          <p className="text-gray-800 font-mono break-all">
            {addressDetails.privateKey}
          </p>
          <button
            onClick={handleDeployContract}
            className="mt-4 w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Déployer le Contrat
          </button>
          {deployStatus && (
            <p className="mt-4 text-sm text-gray-700">{deployStatus}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateAddress;
