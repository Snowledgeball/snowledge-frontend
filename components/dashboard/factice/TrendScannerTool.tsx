import React from 'react';
import { BarChart2, TrendingUp, Calendar, Filter } from 'lucide-react';

// Définition des interfaces pour les données
interface Trend {
    id: number;
    name: string;
    direction: 'up' | 'down';
    change: string;
    description: string;
    tags: string[];
}

interface Correlation {
    id: number;
    pair: string;
    strength: number;
}

interface Event {
    id: number;
    title: string;
    date: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
}

export const TrendScannerTool = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scanner de Tendances</h2>
                    <p className="text-gray-600 dark:text-gray-400">Détection et analyse des mouvements du marché</p>
                </div>
                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tendances Détectées</h3>
                    <div className="flex items-center space-x-2">
                        <select className="text-sm px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option>Dernières 24h</option>
                            <option>Derniers 7 jours</option>
                            <option>Dernier mois</option>
                        </select>
                        <Filter className="h-4 w-4 text-gray-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    {trends.map((trend) => (
                        <TrendItem key={trend.id} trend={trend} />
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Analyse Comparative</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Corrélation des actifs</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Mis à jour il y a 12 min</span>
                    </div>
                    <div className="h-60 w-full bg-gray-100 dark:bg-gray-600 rounded-md flex items-center justify-center">
                        <BarChart2 className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Graphique de corrélation</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {correlations.map((corr) => (
                            <CorrelationTag key={corr.id} correlation={corr} />
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Événements à suivre</h3>
                <div className="space-y-3">
                    {events.map((event) => (
                        <EventItem key={event.id} event={event} />
                    ))}
                </div>
                <button className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium">
                    Voir tous les événements
                </button>
            </div>
        </div>
    );
};

const TrendItem = ({ trend }: { trend: Trend }) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
                <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${trend.direction === 'up'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {trend.direction === 'up' ? '▲ Hausse' : '▼ Baisse'}
                    </span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{trend.name}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{trend.change}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{trend.description}</p>
            <div className="flex flex-wrap gap-2">
                {trend.tags.map((tag: string, index: number) => (
                    <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

const CorrelationTag = ({ correlation }: { correlation: Correlation }) => {
    return (
        <div className={`rounded-md p-2 flex items-center justify-between ${correlation.strength > 0.7
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            : correlation.strength < 0.3
                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            }`}>
            <span className="text-xs font-medium">{correlation.pair}</span>
            <span className="text-xs">{correlation.strength.toFixed(2)}</span>
        </div>
    );
};

const EventItem = ({ event }: { event: Event }) => {
    return (
        <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500 mr-3" />
            <div className="flex-1">
                <div className="flex justify-between">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{event.title}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{event.date}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{event.description}</p>
            </div>
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${event.impact === 'high'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : event.impact === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                {event.impact === 'high' ? 'Impact élevé' : event.impact === 'medium' ? 'Impact moyen' : 'Impact faible'}
            </span>
        </div>
    );
};

// Données fictives
const trends: Trend[] = [
    {
        id: 1,
        name: 'Bitcoin (BTC)',
        direction: 'up',
        change: '+8.2%',
        description: 'Hausse significative du Bitcoin suite à l\'adoption institutionnelle croissante et aux nouvelles réglementations favorables.',
        tags: ['Crypto', 'Institutionnel', 'Réglementation']
    },
    {
        id: 2,
        name: 'NFT Gaming',
        direction: 'down',
        change: '-12.7%',
        description: 'Baisse de l\'intérêt pour les NFT dans le gaming suite à plusieurs controverses et la baisse des volumes d\'échange.',
        tags: ['NFT', 'Gaming', 'Volume']
    },
    {
        id: 3,
        name: 'DeFi TVL',
        direction: 'up',
        change: '+5.4%',
        description: 'Augmentation de la valeur totale verrouillée dans les protocoles DeFi, portée par les nouveaux services de prêt.',
        tags: ['DeFi', 'TVL', 'Lending']
    }
];

const correlations: Correlation[] = [
    { id: 1, pair: 'BTC/ETH', strength: 0.82 },
    { id: 2, pair: 'ETH/SOL', strength: 0.65 },
    { id: 3, pair: 'BTC/GOLD', strength: 0.21 },
    { id: 4, pair: 'BTC/SP500', strength: 0.43 },
    { id: 5, pair: 'ETH/DEFI', strength: 0.75 },
    { id: 6, pair: 'NFT/GAMING', strength: 0.58 }
];

const events: Event[] = [
    {
        id: 1,
        title: 'Mise à jour Ethereum 2.0',
        date: '14 Juil',
        description: 'Déploiement de la mise à jour majeure du réseau Ethereum',
        impact: 'high'
    },
    {
        id: 2,
        title: 'Conférence Blockchain Summit',
        date: '22 Juil',
        description: 'La plus grande conférence blockchain de l\'année avec annonces majeures',
        impact: 'medium'
    },
    {
        id: 3,
        title: 'Rapport trimestriel Coinbase',
        date: '4 Août',
        description: 'Publication des résultats financiers du Q2 2023',
        impact: 'low'
    }
]; 