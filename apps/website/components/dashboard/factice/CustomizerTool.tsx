import React from 'react';
import { Palette, Sliders, Users, Copy, Check, RotateCcw, Eye, Download, Image } from 'lucide-react';

// Définition des interfaces
interface StylePreset {
    id: number;
    name: string;
    description: string;
    previewImage: string;
    usageCount: number;
}

interface AudienceSegment {
    id: number;
    name: string;
    description: string;
    size: number;
    engagement: number;
}

export const CustomizerTool = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personnalisation de Contenu</h2>
                    <p className="text-gray-600 dark:text-gray-400">Adaptez vos messages à chaque audience et plateforme</p>
                </div>
                <Palette className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Éditeur de contenu</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white mb-4"
                            placeholder="Saisissez votre contenu ici..."
                            defaultValue="Découvrez notre nouvelle analyse des tendances du marché crypto pour Q3 2023. Nos experts ont identifié les secteurs à fort potentiel de croissance et les risques à surveiller."
                        ></textarea>

                        <div className="flex flex-wrap gap-3 mb-4">
                            <button className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                Dupliquer
                            </button>
                            <button className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                                <Image className="h-3.5 w-3.5 mr-1" />
                                Ajouter média
                            </button>
                            <button className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Réinitialiser
                            </button>
                            <button className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-xs">
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Aperçu
                            </button>
                            <button className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs ml-auto">
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Appliquer
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ton et style</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            <span>Formel vs Conversationnel</span>
                                            <span>65%</span>
                                        </label>
                                        <input type="range" className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer" defaultValue="65" />
                                    </div>
                                    <div>
                                        <label className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            <span>Informatif vs Persuasif</span>
                                            <span>40%</span>
                                        </label>
                                        <input type="range" className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer" defaultValue="40" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format et structure</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs rounded-md">
                                        Titre + Corps
                                    </button>
                                    <button className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                                        Bullet points
                                    </button>
                                    <button className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                                        Q&A
                                    </button>
                                    <button className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                                        Story
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Préréglages de style</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {stylePresets.map(preset => (
                            <StylePresetCard key={preset.id} preset={preset} />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Segments d'audience</h3>
                            <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                                Gérer
                            </button>
                        </div>
                        <div className="space-y-3">
                            {audienceSegments.map(segment => (
                                <AudienceSegmentCard key={segment.id} segment={segment} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Adaptation de plateforme</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Plateformes actives</h4>
                                <Sliders className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-md">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">T</div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Twitter</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-md">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">L</div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">LinkedIn</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-md">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mr-3">D</div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Discord</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                            <button className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                                Adapter à toutes les plateformes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Variations générées</h3>
                    <button className="flex items-center text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter tout
                    </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">T</div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">Twitter</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">280 caractères max</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">📊 Nouvelle analyse Q3 2023 du marché #crypto : DeFi en hausse de 15%, NFTs en baisse de 8%. Découvrez les secteurs à surveiller et nos prédictions ! #blockchain #investments</p>
                        <div className="flex justify-end space-x-2">
                            <button className="text-xs px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-md">
                                Régénérer
                            </button>
                            <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                                Copier
                            </button>
                        </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">L</div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">LinkedIn</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Professionnel</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">🔍 ANALYSE DE MARCHÉ | Notre équipe d'analystes vient de publier son rapport trimestriel sur le marché des cryptomonnaies pour Q3 2023. Points clés : forte croissance dans le secteur DeFi, opportunités d'investissement dans les infrastructures blockchain, et tendances à surveiller dans les prochains mois. Téléchargez le rapport complet via le lien en commentaire. #MarketAnalysis #Cryptocurrency #Blockchain</p>
                        <div className="flex justify-end space-x-2">
                            <button className="text-xs px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-md">
                                Régénérer
                            </button>
                            <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                                Copier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StylePresetCard = ({ preset }: { preset: StylePreset }) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="h-24 bg-gray-100 dark:bg-gray-600"></div>
            <div className="p-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">{preset.name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{preset.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Utilisé {preset.usageCount} fois</span>
                    <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
};

const AudienceSegmentCard = ({ segment }: { segment: AudienceSegment }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
                <Users className="h-5 w-5 text-indigo-500 mr-3" />
                <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">{segment.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{segment.description}</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
        </div>
    );
};

// Données fictives
const stylePresets: StylePreset[] = [
    {
        id: 1,
        name: "Professionnel",
        description: "Style formel, factuel et informatif",
        previewImage: "/previews/professional.jpg",
        usageCount: 78
    },
    {
        id: 2,
        name: "Dynamique",
        description: "Ton énergique avec appels à l'action",
        previewImage: "/previews/dynamic.jpg",
        usageCount: 54
    },
    {
        id: 3,
        name: "Éducatif",
        description: "Explicatif et orienté apprentissage",
        previewImage: "/previews/educational.jpg",
        usageCount: 41
    }
];

const audienceSegments: AudienceSegment[] = [
    {
        id: 1,
        name: "Investisseurs débutants",
        description: "~24K membres, ~18% engagement",
        size: 24000,
        engagement: 18
    },
    {
        id: 2,
        name: "Traders confirmés",
        description: "~12K membres, ~32% engagement",
        size: 12000,
        engagement: 32
    },
    {
        id: 3,
        name: "Développeurs blockchain",
        description: "~8K membres, ~27% engagement",
        size: 8000,
        engagement: 27
    }
]; 