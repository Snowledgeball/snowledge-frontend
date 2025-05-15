import React from 'react';
import { Share2, ToggleLeft, Settings, Edit2, Plus, LayoutGrid, MessageSquare, Users, BookOpen, Check, Link } from 'lucide-react';

// Définition des interfaces
interface Channel {
    id: number;
    name: string;
    icon: string;
    type: string;
    status: 'active' | 'paused';
    followers: number;
    engagement: number;
    lastPost: string;
}

interface Integration {
    id: number;
    name: string;
    icon: string;
    status: 'connected' | 'disconnected';
    lastSync: string;
}

export const MultiChannelTool = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion Multi-canaux</h2>
                    <p className="text-gray-600 dark:text-gray-400">Centralisez la gestion de tous vos canaux de communication</p>
                </div>
                <Share2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Canaux connectés</h3>
                    <button className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un canal
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {channels.map(channel => (
                        <ChannelCard key={channel.id} channel={channel} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Activité récente</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <LayoutGrid className="h-5 w-5 text-gray-400 mr-2" />
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">Vue d'ensemble</h4>
                            </div>
                            <select className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                <option>Cette semaine</option>
                                <option>Ce mois</option>
                                <option>Ce trimestre</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <ActivityItem
                                icon={<MessageSquare className="h-4 w-4 text-blue-500" />}
                                channel="Twitter"
                                action="Publication automatique"
                                content="Analyse hebdomadaire : Les tendances crypto à surveiller"
                                time="Il y a 2 heures"
                                status="success"
                            />
                            <ActivityItem
                                icon={<Users className="h-4 w-4 text-purple-500" />}
                                channel="Discord"
                                action="Message épinglé"
                                content="Annonce de notre prochain AMA avec l'expert en DeFi"
                                time="Il y a 5 heures"
                                status="success"
                            />
                            <ActivityItem
                                icon={<BookOpen className="h-4 w-4 text-indigo-500" />}
                                channel="Blog"
                                action="Nouvel article"
                                content="Guide complet : Comprendre les NFTs et leur potentiel"
                                time="Il y a 1 jour"
                                status="success"
                            />
                            <ActivityItem
                                icon={<MessageSquare className="h-4 w-4 text-red-500" />}
                                channel="LinkedIn"
                                action="Publication programmée"
                                content="Webinaire : Comment investir dans le Web3"
                                time="Il y a 1 jour"
                                status="failed"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Intégrations</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="space-y-3">
                            {integrations.map(integration => (
                                <IntegrationItem key={integration.id} integration={integration} />
                            ))}
                        </div>
                        <button className="mt-4 w-full flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter une intégration
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Configuration rapide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickSetupCard
                        title="Publication synchronisée"
                        description="Publiez simultanément sur plusieurs canaux avec personnalisation automatique par plateforme."
                        isActive={true}
                    />
                    <QuickSetupCard
                        title="Réponses automatiques"
                        description="Configurez des réponses automatiques pour les questions fréquentes sur tous vos canaux."
                        isActive={false}
                    />
                    <QuickSetupCard
                        title="Rapports consolidés"
                        description="Recevez un rapport hebdomadaire de performance consolidé pour tous vos canaux."
                        isActive={true}
                    />
                </div>
            </div>
        </div>
    );
};

const ChannelCard = ({ channel }: { channel: Channel }) => {
    const getChannelIcon = () => {
        switch (channel.icon) {
            case 'twitter':
                return 'T';
            case 'linkedin':
                return 'L';
            case 'facebook':
                return 'F';
            case 'discord':
                return 'D';
            case 'instagram':
                return 'I';
            case 'youtube':
                return 'Y';
            default:
                return 'X';
        }
    };

    const getChannelColor = () => {
        switch (channel.icon) {
            case 'twitter':
                return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
            case 'linkedin':
                return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300';
            case 'facebook':
                return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
            case 'discord':
                return 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300';
            case 'instagram':
                return 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300';
            case 'youtube':
                return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg ${getChannelColor()} flex items-center justify-center font-medium text-lg mr-3`}>
                        {getChannelIcon()}
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{channel.name}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{channel.type}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${channel.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                        {channel.status === 'active' ? 'Actif' : 'En pause'}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Abonnés</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{channel.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Engagement</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{channel.engagement}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Dernière publication</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{channel.lastPost}</span>
                </div>
            </div>
        </div>
    );
};

const ActivityItem = ({
    icon,
    channel,
    action,
    content,
    time,
    status
}: {
    icon: React.ReactNode;
    channel: string;
    action: string;
    content: string;
    time: string;
    status: 'success' | 'failed' | 'pending';
}) => {
    return (
        <div className="flex items-start p-3 bg-white dark:bg-gray-600 rounded-lg">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md mr-3">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center">
                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{channel}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{content}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
                        {status === 'success' && (
                            <span className="text-xs text-green-500 flex items-center mt-1">
                                <Check className="h-3 w-3 mr-1" />
                                Réussi
                            </span>
                        )}
                        {status === 'failed' && (
                            <span className="text-xs text-red-500 flex items-center mt-1">
                                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Échec
                            </span>
                        )}
                        {status === 'pending' && (
                            <span className="text-xs text-yellow-500 flex items-center mt-1">
                                <svg className="h-3 w-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                En cours
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const IntegrationItem = ({ integration }: { integration: Integration }) => {
    const getIntegrationIcon = () => {
        switch (integration.icon) {
            case 'zapier':
                return 'Z';
            case 'buffer':
                return 'B';
            case 'hootsuite':
                return 'H';
            case 'mailchimp':
                return 'M';
            default:
                return 'X';
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center font-medium text-gray-700 dark:text-gray-300 mr-3">
                    {getIntegrationIcon()}
                </div>
                <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{integration.name}</p>
                    <div className="flex items-center mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                            } mr-1`}></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {integration.status === 'connected' ? 'Connecté' : 'Déconnecté'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{integration.lastSync}</span>
                <Link className="h-4 w-4 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400" />
            </div>
        </div>
    );
};

const QuickSetupCard = ({
    title,
    description,
    isActive
}: {
    title: string;
    description: string;
    isActive: boolean;
}) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">{title}</h4>
                <div className="relative">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={isActive}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            <button className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                <Settings className="h-3 w-3 mr-1" />
                Configurer
            </button>
        </div>
    );
};

// Données fictives
const channels: Channel[] = [
    {
        id: 1,
        name: "Crypto Insights",
        icon: "twitter",
        type: "Compte principal",
        status: "active",
        followers: 24500,
        engagement: 3.8,
        lastPost: "Il y a 2 heures"
    },
    {
        id: 2,
        name: "Blockchain Pro",
        icon: "linkedin",
        type: "Page entreprise",
        status: "active",
        followers: 18200,
        engagement: 2.5,
        lastPost: "Il y a 1 jour"
    },
    {
        id: 3,
        name: "Crypto Community",
        icon: "discord",
        type: "Serveur communautaire",
        status: "active",
        followers: 9800,
        engagement: 12.3,
        lastPost: "Il y a 5 heures"
    },
    {
        id: 4,
        name: "DeFi Updates",
        icon: "youtube",
        type: "Chaîne vidéo",
        status: "paused",
        followers: 15600,
        engagement: 4.2,
        lastPost: "Il y a 1 semaine"
    }
];

const integrations: Integration[] = [
    {
        id: 1,
        name: "Zapier",
        icon: "zapier",
        status: "connected",
        lastSync: "Il y a 30 min"
    },
    {
        id: 2,
        name: "Buffer",
        icon: "buffer",
        status: "connected",
        lastSync: "Il y a 2 heures"
    },
    {
        id: 3,
        name: "Hootsuite",
        icon: "hootsuite",
        status: "disconnected",
        lastSync: "Il y a 3 jours"
    }
]; 