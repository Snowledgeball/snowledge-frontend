import React from 'react';
import { Workflow } from 'lucide-react';

export const CollabEditorTool = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Éditeur collaboratif</h2>
                    <p className="text-gray-600">Collaboration en temps réel avec d'autres contributeurs</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        <Workflow className="w-4 h-4 mr-2 inline-block" />
                        Nouvelle édition
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                        Revenir à l'édition précédente
                    </button>
                </div>
            </div>

            {/* Interface d'édition principale */}
            <div className="grid grid-cols-4 gap-6">
                {/* Éditeur principal */}
                <div className="col-span-3 space-y-6">
                    {/* Zone de texte */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <h3 className="font-semibold">Document: Analyse des tendances crypto Q2 2023</h3>
                                <div className="flex ml-4 space-x-1">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                                        JD
                                    </span>
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                                        ML
                                    </span>
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-600">
                                        +3
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <span>Dernière modification il y a 5 min</span>
                                <span className="mx-2">•</span>
                                <span>Auto-enregistrement activé</span>
                            </div>
                        </div>
                        <textarea
                            className="w-full h-96 border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Commencez à rédiger votre document collaboratif ici..."
                            defaultValue="# Analyse des tendances crypto Q2 2023

## Introduction
Le marché des cryptomonnaies a connu un rebond significatif au cours du deuxième trimestre 2023, après une période prolongée de consolidation.

## Tendances majeures
- **Adoption institutionnelle**: Poursuite de l'intégration par les grandes entreprises
- **DeFi 2.0**: Nouvelles applications avec un focus sur la sécurité et l'interopérabilité
- **NFTs évolutifs**: Applications pratiques au-delà de l'art

## Analyses sectorielles
"
                        ></textarea>
                    </div>

                    {/* Barre d'outils de formatage */}
                    <div className="flex flex-wrap gap-2 bg-white rounded-xl shadow-sm p-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h8a4 4 0 1 1 0 8H6V4Zm0 8h8a4 4 0 1 1 0 8H6v-8Z" />
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 3h16a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 4h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm0 8h16a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1Zm0-4h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1Z" />
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg font-bold">
                            B
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg italic">
                            I
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg underline">
                            U
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-1"></div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <path d="m21 15-5-5L5 21"></path>
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </button>
                        <div className="flex-1"></div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Partager
                        </button>
                    </div>
                </div>

                {/* Panneau latéral */}
                <div className="space-y-6">
                    {/* Collaborateurs */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-4">Collaborateurs</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium mr-3">
                                        JD
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Jean Dupont</p>
                                        <p className="text-xs text-gray-500">Éditeur</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium mr-3">
                                        ML
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Marie Lambert</p>
                                        <p className="text-xs text-gray-500">Contributeur</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-medium mr-3">
                                        PT
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Paul Torres</p>
                                        <p className="text-xs text-gray-500">Spectateur</p>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                            + Inviter un collaborateur
                        </button>
                    </div>

                    {/* Commentaires */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-4">Commentaires</h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-xs mr-2">
                                        ML
                                    </div>
                                    <p className="text-xs text-gray-500">il y a 10 min</p>
                                </div>
                                <p className="text-sm text-gray-700">Peut-on ajouter une section sur les régulations récentes et leur impact?</p>
                                <div className="flex justify-end mt-2">
                                    <button className="text-xs text-blue-600 hover:underline">Répondre</button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs mr-2">
                                        JD
                                    </div>
                                    <p className="text-xs text-gray-500">il y a 5 min</p>
                                </div>
                                <p className="text-sm text-gray-700">Excellente idée, je vais créer cette section.</p>
                            </div>
                        </div>

                        <div className="mt-4 relative">
                            <input
                                type="text"
                                placeholder="Ajouter un commentaire..."
                                className="w-full px-3 py-2 border rounded-lg pr-10"
                            />
                            <button className="absolute right-3 top-2.5 text-blue-600">
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="m22 2-7 20-4-9-9-4 20-7Z"></path>
                                    <path d="M22 2 11 13"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 