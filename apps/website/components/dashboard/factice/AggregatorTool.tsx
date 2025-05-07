import React from "react";
import { Link2, Search, Rss } from "lucide-react";
import { aggregatorData } from "./mockData";

export const AggregatorTool = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agrégateur de Sources
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Centralisation et gestion des flux d'information
          </p>
        </div>
        <Rss className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Sources configurées
          </h3>
          <button className="text-sm px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Ajouter une source
          </button>
        </div>

        <div className="space-y-3">
          {sources.map((source) => (
            <SourceItem key={source.id} source={source} />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Dernières mises à jour
        </h3>
        <div className="space-y-4">
          {updates.map((update) => (
            <UpdateItem key={update.id} update={update} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Statistiques
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Sources actives" value="24" change="+3" />
          <StatCard title="Articles aujourd'hui" value="146" change="+52" />
          <StatCard
            title="Taux d'engagement"
            value="18.7%"
            change="-2.3%"
            isNegative
          />
        </div>
      </div>
    </div>
  );
};

const SourceItem = ({ source }: { source: any }) => {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center space-x-3">
        <div
          className={`w-3 h-3 rounded-full ${
            source.active ? "bg-green-500" : "bg-gray-400"
          }`}
        ></div>
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {source.name}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {source.type}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
          Éditer
        </button>
        <button className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
          Supprimer
        </button>
      </div>
    </div>
  );
};

const UpdateItem = ({ update }: { update: any }) => {
  return (
    <div className="border-l-4 border-indigo-500 pl-4 py-2">
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-800 dark:text-gray-200">
          {update.title}
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {update.time}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {update.content}
      </p>
      <div className="mt-2 flex items-center space-x-2">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          {update.source}
        </span>
        <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          Voir l'article
        </button>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  change,
  isNegative = false,
}: {
  title: string;
  value: string;
  change: string;
  isNegative?: boolean;
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <h4 className="text-sm text-gray-600 dark:text-gray-400">{title}</h4>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {value}
        </span>
        <span
          className={`text-sm ${
            isNegative ? "text-red-500" : "text-green-500"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
};

// Données fictives
const sources = [
  { id: 1, name: "Twitter API", type: "Réseau social", active: true },
  { id: 2, name: "Reddit r/Ethereum", type: "Forum", active: true },
  { id: 3, name: "Coindesk", type: "Actualités", active: true },
  { id: 4, name: "GitHub Blockchain", type: "Dév", active: false },
];

const updates = [
  {
    id: 1,
    title: "Annonce majeure de Vitalik Buterin",
    content:
      "Le fondateur d Ethereum a annoncé une mise à jour importante concernant la transition vers PoS.",
    source: "Twitter",
    time: "Il y a 23 min",
  },
  {
    id: 2,
    title: "Hausse spectaculaire du Bitcoin",
    content:
      "Le BTC a franchi la barre des 42 000$ suite à des annonces positives de la SEC.",
    source: "Coindesk",
    time: "Il y a 1h",
  },
  {
    id: 3,
    title: "Nouveau projet DeFi populaire",
    content:
      "Un nouveau protocole DeFi attire l'attention avec plus de 500M$ de TVL en 48h.",
    source: "Reddit",
    time: "Il y a 3h",
  },
];
