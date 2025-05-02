import React from 'react';
import { FileText, Search, Filter, PlusCircle, Calendar, User } from 'lucide-react';

// Définition des interfaces
interface Template {
    id: number;
    title: string;
    category: string;
    lastUsed: string;
    usageCount: number;
    createdBy: string;
    status: 'active' | 'draft';
}

export const TemplatesTools = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bibliothèque de Modèles</h2>
                    <p className="text-gray-600 dark:text-gray-400">Créez et gérez vos modèles de contenu</p>
                </div>
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="mb-6">
                <div className="flex justify-between mb-4">
                    <div className="relative w-72">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un modèle..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                            <Filter className="h-4 w-4 mr-2" />
                            Filtrer
                        </button>
                        <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Nouveau modèle
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Titre</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catégorie</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dernière utilisation</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisations</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créé par</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {templates.map((template) => (
                                <TemplateRow key={template.id} template={template} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Modèles populaires</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                                <FileText className="h-5 w-5 text-indigo-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Analyse de marché</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Utilisé 78 fois ce mois-ci</p>
                                </div>
                            </div>
                            <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                                Utiliser
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                                <FileText className="h-5 w-5 text-indigo-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">Rapport mensuel</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Utilisé 52 fois ce mois-ci</p>
                                </div>
                            </div>
                            <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                                Utiliser
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Activité récente</h3>
                    <div className="space-y-3">
                        <div className="flex items-start p-3 border-l-2 border-indigo-500">
                            <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    Modèle <span className="font-medium">Newsletter hebdomadaire</span> créé par Marie
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">il y a 2 heures</p>
                            </div>
                        </div>
                        <div className="flex items-start p-3 border-l-2 border-indigo-500">
                            <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    Modèle <span className="font-medium">Analyse de tendances</span> modifié par Jean
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">il y a 5 heures</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TemplateRow = ({ template }: { template: Template }) => {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="py-3 px-4">
                <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{template.title}</span>
                </div>
            </td>
            <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{template.category}</span>
            </td>
            <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{template.lastUsed}</span>
            </td>
            <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{template.usageCount}</span>
            </td>
            <td className="py-3 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{template.createdBy}</span>
            </td>
            <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs rounded-full ${template.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {template.status === 'active' ? 'Actif' : 'Brouillon'}
                </span>
            </td>
            <td className="py-3 px-4">
                <div className="flex space-x-2">
                    <button className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                        Éditer
                    </button>
                    <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                        Utiliser
                    </button>
                </div>
            </td>
        </tr>
    );
};

// Données fictives
const templates: Template[] = [
    {
        id: 1,
        title: "Publication blog crypto",
        category: "Blog",
        lastUsed: "Aujourd'hui",
        usageCount: 45,
        createdBy: "Jean Dupont",
        status: "active"
    },
    {
        id: 2,
        title: "Rapport d'analyse hebdomadaire",
        category: "Rapport",
        lastUsed: "Hier",
        usageCount: 32,
        createdBy: "Marie Lambert",
        status: "active"
    },
    {
        id: 3,
        title: "Newsletter mensuelle",
        category: "Email",
        lastUsed: "21/06/2023",
        usageCount: 28,
        createdBy: "Paul Torres",
        status: "active"
    },
    {
        id: 4,
        title: "Annonce nouvelle fonctionnalité",
        category: "Réseaux sociaux",
        lastUsed: "14/06/2023",
        usageCount: 15,
        createdBy: "Sophie Martin",
        status: "draft"
    },
    {
        id: 5,
        title: "Étude de cas client",
        category: "Marketing",
        lastUsed: "10/06/2023",
        usageCount: 8,
        createdBy: "Jean Dupont",
        status: "draft"
    }
]; 