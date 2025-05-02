import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Search, Shield, ExternalLink } from 'lucide-react';

// Définition des interfaces
interface FactCheck {
    id: number;
    statement: string;
    verdict: 'true' | 'misleading' | 'false';
    explanation: string;
    sources: string[];
    date: string;
    category: string;
}

export const FactCheckerTool = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vérificateur de Faits</h2>
                    <p className="text-gray-600 dark:text-gray-400">Validez l'exactitude des informations avant publication</p>
                </div>
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Vérification de déclaration</h3>
                        <div className="mt-2 md:mt-0 flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Basé sur IA + sources vérifiées</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <Search className="h-4 w-4 absolute left-3 top-3.5 text-gray-400" />
                        <textarea
                            className="pl-10 pr-4 py-3 w-full h-24 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white"
                            placeholder="Entrez une affirmation à vérifier..."
                            defaultValue="Le Bitcoin a connu une hausse de 30% en 24h suite à l'adoption d'un ETF spot par la SEC."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                            Vérifier maintenant
                        </button>
                        <div className="md:col-span-3 flex space-x-2">
                            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-500 flex-1">
                                Marchés financiers
                            </button>
                            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-500 flex-1">
                                Technologie blockchain
                            </button>
                            <button className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-500 flex-1">
                                Réglementation
                            </button>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Vérifications récentes</h3>
                <div className="space-y-4">
                    {factChecks.map(factCheck => (
                        <FactCheckItem key={factCheck.id} factCheck={factCheck} />
                    ))}
                </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Sources de confiance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TrustedSource
                        name="CryptoFacts.org"
                        description="Vérification indépendante des informations blockchain"
                        reliability={98}
                    />
                    <TrustedSource
                        name="ChainAnalysis"
                        description="Analyse des données on-chain en temps réel"
                        reliability={95}
                    />
                    <TrustedSource
                        name="BlockchainReview"
                        description="Actualités blockchain avec peer-review"
                        reliability={92}
                    />
                </div>
            </div>
        </div>
    );
};

const FactCheckItem = ({ factCheck }: { factCheck: FactCheck }) => {
    const getVerdictIcon = () => {
        switch (factCheck.verdict) {
            case 'true':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'misleading':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'false':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getVerdictClass = () => {
        switch (factCheck.verdict) {
            case 'true':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'misleading':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'false':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return '';
        }
    };

    const getVerdictText = () => {
        switch (factCheck.verdict) {
            case 'true':
                return 'Vrai';
            case 'misleading':
                return 'Trompeur';
            case 'false':
                return 'Faux';
            default:
                return '';
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start">
                <div className="mt-1 mr-3">
                    {getVerdictIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{factCheck.statement}</h4>
                        <div className="mt-2 md:mt-0 flex items-center">
                            <span className={`text-xs px-2 py-1 rounded-full ${getVerdictClass()}`}>
                                {getVerdictText()}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{factCheck.date}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{factCheck.explanation}</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Sources :</span>
                        {factCheck.sources.map((source, index) => (
                            <a
                                key={index}
                                href="#"
                                className="text-xs flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {source}
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrustedSource = ({
    name,
    description,
    reliability
}: {
    name: string;
    description: string;
    reliability: number;
}) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">{name}</h4>
                <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Fiabilité</span>
                    <span className="text-xs font-medium text-green-600">{reliability}%</span>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
            <div className="flex justify-between items-center">
                <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                    Voir site web
                    <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <button className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500">
                    Ajouter
                </button>
            </div>
        </div>
    );
};

// Données fictives
const factChecks: FactCheck[] = [
    {
        id: 1,
        statement: "Le Bitcoin a connu une hausse de 30% en 24h suite à l'adoption d'un ETF spot par la SEC.",
        verdict: "misleading",
        explanation: "Le Bitcoin a effectivement connu une hausse, mais de 15% (non 30%) sur 24h après l'annonce de l'approbation d'un ETF Bitcoin spot par la SEC.",
        sources: ["Bloomberg", "CoinDesk", "SEC.gov"],
        date: "Aujourd'hui",
        category: "Marchés"
    },
    {
        id: 2,
        statement: "Ethereum a finalisé sa transition vers Proof-of-Stake en 2022.",
        verdict: "true",
        explanation: "Ethereum a bien effectué sa transition (The Merge) vers le consensus Proof-of-Stake en septembre 2022, réduisant sa consommation d'énergie de 99,95%.",
        sources: ["Ethereum.org", "Coinbase Research"],
        date: "Hier",
        category: "Technologie"
    },
    {
        id: 3,
        statement: "Le fondateur de Binance a vendu tous ses bitcoins en 2023.",
        verdict: "false",
        explanation: "Aucune preuve ne démontre cette affirmation. Le CEO de Binance a déclaré publiquement qu'il conservait toujours une partie significative de ses actifs en Bitcoin.",
        sources: ["Déclaration officielle Binance", "Forbes"],
        date: "Il y a 2 jours",
        category: "Personnalités"
    }
]; 