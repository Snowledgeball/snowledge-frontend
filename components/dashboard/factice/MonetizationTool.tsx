import React from 'react';
import { Wallet, Users, FileText, TrendingUp, ArrowUpRight, Lightbulb } from 'lucide-react';
import { monetizationData } from './mockData';

export const MonetizationTool = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Monétisation automatique</h2>
                    <p className="text-gray-600">Maximisez vos revenus grâce aux outils de monétisation intelligents</p>
                </div>
                <div className="flex space-x-3">
                    <select className="px-3 py-2 border rounded-lg">
                        <option>30 derniers jours</option>
                        <option>Dernier trimestre</option>
                        <option>Cette année</option>
                        <option>Tout le temps</option>
                    </select>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Configuration avancée
                    </button>
                </div>
            </div>

            {/* Dashboard revenus */}
            <div className="grid grid-cols-4 gap-6">
                {monetizationData.revenueStats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                            {stat.icon === 'Wallet' && <Wallet className="w-4 h-4 text-green-500" />}
                            {stat.icon === 'Users' && <Users className="w-4 h-4 text-blue-500" />}
                            {stat.icon === 'FileText' && <FileText className="w-4 h-4 text-purple-500" />}
                            {stat.icon === 'TrendingUp' && <TrendingUp className="w-4 h-4 text-amber-500" />}
                        </div>
                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                        <div className={`flex items-center mt-2 text-sm ${stat.negative ? 'text-red-600' : 'text-green-600'}`}>
                            <ArrowUpRight className={`w-3 h-3 mr-1 ${stat.negative ? 'transform rotate-180' : ''}`} />
                            <span>{stat.change} vs période précédente</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold mb-6">Évolution des revenus</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">Graphique d'évolution des revenus</p>
                    </div>
                    <div className="flex justify-between mt-4 text-sm text-gray-500">
                        <div>
                            <span className="font-medium text-gray-900">Revenu moyen: </span>
                            <span>41.61€ par jour</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Meilleur jour: </span>
                            <span>152.87€ (15 mars)</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold mb-6">Sources de revenus</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-400">Graphique de répartition des sources</p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">
                        {monetizationData.revenueSources.map((source, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`w-3 h-3 bg-${source.color}-500 rounded-full mr-2`}></div>
                                <span className="text-sm text-gray-600">{source.source} ({source.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sources de revenus détaillées */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold">Détail des sources de revenus</h3>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        Exporter les données
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="pb-3 font-medium text-gray-500">Source</th>
                            <th className="pb-3 font-medium text-gray-500">Revenus</th>
                            <th className="pb-3 font-medium text-gray-500">Variation</th>
                            <th className="pb-3 font-medium text-gray-500">Transactions</th>
                            <th className="pb-3 font-medium text-gray-500">Taux de conversion</th>
                            <th className="pb-3 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monetizationData.revenueDetails.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-4 font-medium">{item.source}</td>
                                <td className="py-4">{item.revenue}</td>
                                <td className="py-4">
                                    <div className="flex items-center">
                                        {item.trend === "up" ? (
                                            <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
                                        ) : (
                                            <ArrowUpRight className="w-3 h-3 mr-1 text-red-600 transform rotate-180" />
                                        )}
                                        <span className={item.trend === "up" ? "text-green-600" : "text-red-600"}>
                                            {item.change}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4">{item.transactions}</td>
                                <td className="py-4">{item.conversion}</td>
                                <td className="py-4">
                                    <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg">
                                        Optimiser
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recommandations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Recommandations d'optimisation</h3>
                <div className="space-y-4">
                    {monetizationData.optimizationRecommendations.map((recommendation, index) => (
                        <div
                            key={index}
                            className={`p-4 border border-${recommendation.type}-200 bg-${recommendation.type}-50 rounded-lg`}
                        >
                            <div className="flex items-start">
                                <Lightbulb className={`w-5 h-5 text-${recommendation.type}-600 mr-3 mt-0.5`} />
                                <div>
                                    <h4 className={`font-medium text-${recommendation.type}-800`}>{recommendation.title}</h4>
                                    <p className={`text-sm text-${recommendation.type}-700 mt-1`}>{recommendation.description}</p>
                                    <button
                                        className={`mt-2 px-3 py-1 bg-${recommendation.type}-600 text-white text-sm rounded-lg hover:bg-${recommendation.type}-700`}
                                    >
                                        Mettre en place
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 