import React from "react";
import { Edit, FileText, BrainCircuit } from "lucide-react";
import { aiAssistantData } from "./mockData";

export const AIAssistant = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Assistant de rédaction</h2>
          <p className="text-gray-600">
            Utilisez l'intelligence artificielle pour améliorer vos textes
          </p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Nouvelle rédaction
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Éditeur de texte</h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <FileText className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Zone de texte */}
          <textarea
            className="w-full h-64 border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Commencez à rédiger votre texte ici ou importez un contenu existant..."
          ></textarea>

          {/* Options d'édition */}
          <div className="flex space-x-2 mt-4">
            <button className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
              Améliorer le style
            </button>
            <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
              Simplifier
            </button>
            <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
              Corriger la grammaire
            </button>
            <button className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">
              Adapter au ton
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Suggestions AI */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <BrainCircuit className="w-4 h-4 mr-2 text-purple-500" />
              Suggestions de l'IA
            </h3>
            <div className="space-y-3">
              {aiAssistantData.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-purple-50 rounded-lg border border-purple-100"
                >
                  <p className="text-sm text-gray-700">{suggestion.text}</p>
                  <button className="text-xs text-purple-600 mt-1 hover:underline">
                    {suggestion.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ton et format */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">Ton et format</h3>
            <div className="space-y-3">
              <select className="w-full px-3 py-2 border rounded-lg">
                {aiAssistantData.toneOptions.map((option, index) => (
                  <option key={index}>{option}</option>
                ))}
              </select>
              <select className="w-full px-3 py-2 border rounded-lg">
                {aiAssistantData.formatOptions.map((option, index) => (
                  <option key={index}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Données SEO */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">Optimisation SEO</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${aiAssistantData.seoScore}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {aiAssistantData.seoScore}%
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Densité des mots-clés optimale
              </p>
              <button className="w-full mt-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                Voir le rapport complet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
