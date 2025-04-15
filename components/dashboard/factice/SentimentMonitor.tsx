import React from 'react';
import { ThumbsUp, Search } from 'lucide-react';
import { sentimentData } from './mockData';

export const SentimentMonitor = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Moniteur de sentiments</h2>
                    <p className="text-gray-600">Analysez l'opinion publique sur des sujets spécifiques</p>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un sujet..."
                            className="px-4 py-2 border rounded-lg pr-8"
                        />
                        <Search className="absolute top-2.5 right-2.5 w-4 h-4 text-gray-400" />
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Analyser
                    </button>
                </div>
            </div>

            {/* Sources et plateformes */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Sentiment par plateforme</h3>
                    <div className="space-y-4">
                        {sentimentData.platformSentiment.map((item, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.platform}</span>
                                    <span className="text-xs text-gray-500">
                                        {item.positive}% positif
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="flex h-full">
                                        <div className="h-full bg-green-500" style={{ width: `${item.positive}%` }}></div>
                                        <div className="h-full bg-yellow-400" style={{ width: `${item.neutral}%` }}></div>
                                        <div className="h-full bg-red-500" style={{ width: `${item.negative}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Sujets associés</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {sentimentData.associatedTopics.map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium">{item.topic}</span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${item.sentiment === "positif" ? "bg-green-100 text-green-600" :
                                        item.sentiment === "négatif" ? "bg-red-100 text-red-600" :
                                            "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {item.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mentions récentes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Mentions récentes significatives</h3>
                <div className="space-y-4">
                    {sentimentData.significantMentions.map((item, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-lg border ${item.sentiment === "positif" ? "border-green-200 bg-green-50" :
                                item.sentiment === "négatif" ? "border-red-200 bg-red-50" :
                                    "border-gray-200 bg-gray-50"
                                }`}
                        >
                            <p className="text-gray-800">{item.text}</p>
                            <div className="flex justify-between mt-2">
                                <div className="flex items-center text-sm">
                                    <span className="font-medium mr-2">{item.platform}</span>
                                    <span className="text-gray-500">{item.user}</span>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${item.sentiment === "positif" ? "bg-green-100 text-green-600" :
                                        item.sentiment === "négatif" ? "bg-red-100 text-red-600" :
                                            "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {item.sentiment}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 