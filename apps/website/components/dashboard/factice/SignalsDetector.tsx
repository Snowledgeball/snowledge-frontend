import React from 'react';
import { Signal, Database, CheckCircle } from 'lucide-react';
import { signalsData } from './mockData';

export const SignalsDetector = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Détecteur de signaux</h2>
                    <p className="text-gray-600">Identifiez les signaux faibles et tendances émergentes</p>
                </div>
                <div className="flex space-x-3">
                    <div>
                        <select className="px-3 py-2 border rounded-lg bg-white">
                            <option>Crypto & Blockchain</option>
                            <option>Finance</option>
                            <option>Tech</option>
                            <option>Tous les domaines</option>
                        </select>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Alertes de signaux */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Signaux détectés récemment</h3>
                    <div className="flex items-center text-sm">
                        <span className="text-gray-500 mr-2">Sensibilité:</span>
                        <select className="px-2 py-1 border rounded-lg text-sm">
                            <option>Élevée</option>
                            <option>Moyenne</option>
                            <option>Faible</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {signalsData.recentSignals.map((signal, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between">
                                <h4 className="font-medium text-gray-900">{signal.title}</h4>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">{signal.time}</span>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${signal.intensity === "Fort" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                            }`}
                                    >
                                        {signal.domain}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{signal.description}</p>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">Confiance:</span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${signal.confidence > 80 ? "bg-green-500" : "bg-yellow-500"}`}
                                            style={{ width: `${signal.confidence}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs ml-2">{signal.confidence}%</span>
                                </div>
                                <div className="flex items-center">
                                    <Database className="w-3 h-3 text-gray-400 mr-1" />
                                    <span className="text-xs text-gray-500">{signal.sources} sources</span>
                                </div>
                                <button className="text-xs text-blue-600 hover:underline">Analyser</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cartographie des signaux */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Cartographie des signaux</h3>
                <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">Visualisation des clusters thématiques</p>
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-500">
                    <div>
                        <span className="text-xs text-gray-500">La taille des cercles représente l'intensité du signal</span>
                    </div>
                    <div>
                        <button className="text-blue-600 hover:underline text-sm">Changer de visualisation</button>
                    </div>
                </div>
            </div>

            {/* Comparaison historique */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Prédiction & historique</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Probabilité de tendance majeure</span>
                            <span className="text-sm font-medium text-green-600">{signalsData.predictions.trendProbability}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Signaux similaires passés</span>
                            <span className="text-sm font-medium">{signalsData.predictions.similarSignals}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Temps moyen avant adoption</span>
                            <span className="text-sm font-medium">{signalsData.predictions.adoptionTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Potentiel disruptif</span>
                            <span className="text-sm font-medium text-amber-600">{signalsData.predictions.disruptivePotential}</span>
                        </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                        Voir l'analyse complète
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Actions recommandées</h3>
                    <div className="space-y-3">
                        {signalsData.recommendedActions.map((action, i) => (
                            <div key={i} className="flex items-start">
                                <div className="p-1 bg-green-100 rounded-full mt-0.5 mr-2">
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-sm">{action}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-sm">
                        Générer un plan d'action
                    </button>
                </div>
            </div>
        </div>
    );
}; 