import React from 'react';
import { TrendingUp, Target, Zap, Filter, Plus, BarChart2, Settings, ArrowRight, Award, Users, ExternalLink, ChevronRight, PieChart, Heart } from 'lucide-react';

// Définition des interfaces
interface Campaign {
    id: number;
    title: string;
    status: 'active' | 'paused' | 'completed';
    startDate: string;
    endDate: string;
    budget: string;
    reach: number;
    conversion: number;
}

interface TargetSegment {
    id: number;
    name: string;
    audience: number;
    engagement: number;
    platform: string;
}

interface PromotedContent {
    id: number;
    title: string;
    type: string;
    performance: number;
    views: number;
    engagement: number;
}

export const AmplifierTool = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Amplificateur de Contenu</h2>
                    <p className="text-gray-600 dark:text-gray-400">Boostez la portée et l'impact de vos publications</p>
                </div>
                <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Campagnes en cours</h3>
                        <button className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle campagne
                        </button>
                    </div>

                    <div className="space-y-4">
                        {campaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Performance</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Vue d'ensemble</h4>
                            <select className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                <option>30 derniers jours</option>
                                <option>3 derniers mois</option>
                                <option>Cette année</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <MetricItem
                                label="Portée totale"
                                value="142.5K"
                                change="+24.8%"
                                isPositive={true}
                            />
                            <MetricItem
                                label="Taux d'engagement"
                                value="6.2%"
                                change="+1.5%"
                                isPositive={true}
                            />
                            <MetricItem
                                label="Conversion"
                                value="3.8%"
                                change="+0.7%"
                                isPositive={true}
                            />
                            <MetricItem
                                label="ROI"
                                value="287%"
                                change="+32%"
                                isPositive={true}
                            />
                        </div>

                        <div className="h-40 mt-4 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-md">
                            <PieChart className="h-6 w-6 text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Graphique de performance</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Segments ciblés</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">Audience</h4>
                            <button className="text-xs flex items-center text-indigo-600 dark:text-indigo-400">
                                Gérer
                                <ChevronRight className="h-3 w-3 ml-1" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {targetSegments.map(segment => (
                                <TargetSegmentItem key={segment.id} segment={segment} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Contenu promu</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contenu</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vues</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Engagement</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {promotedContent.map(content => (
                                    <PromotedContentRow key={content.id} content={content} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recommandations d'optimisation</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <OptimizationCard
                        icon={<Target className="h-5 w-5 text-indigo-500" />}
                        title="Affiner le ciblage"
                        description="Vous pourriez augmenter le taux de conversion de 18% en ajustant vos segments d'audience."
                        actionText="Optimiser le ciblage"
                    />
                    <OptimizationCard
                        icon={<BarChart2 className="h-5 w-5 text-indigo-500" />}
                        title="Augmenter le budget"
                        description="Augmenter le budget de la campagne 'NFT Insights' de 20% pourrait doubler sa portée."
                        actionText="Ajuster le budget"
                    />
                    <OptimizationCard
                        icon={<Award className="h-5 w-5 text-indigo-500" />}
                        title="Contenu à promouvoir"
                        description="Votre article sur les Smart Contracts performe très bien organiquement. Boostez-le davantage."
                        actionText="Promouvoir le contenu"
                    />
                </div>
            </div>
        </div>
    );
};

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const getStatusColor = () => {
        switch (campaign.status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return '';
        }
    };

    const getStatusText = () => {
        switch (campaign.status) {
            case 'active':
                return 'Active';
            case 'paused':
                return 'En pause';
            case 'completed':
                return 'Terminée';
            default:
                return '';
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{campaign.title}</h4>
                    <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{campaign.startDate} - {campaign.endDate}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Budget: {campaign.budget}</span>
                    </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Portée</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{campaign.reach.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Conversion</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{campaign.conversion}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${campaign.conversion * 10}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-3 space-x-2">
                <button className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    Détails
                </button>
                <button className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Settings className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
};

const MetricItem = ({
    label,
    value,
    change,
    isPositive
}: {
    label: string;
    value: string;
    change: string;
    isPositive: boolean;
}) => {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            <div className="flex items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200 mr-2">{value}</span>
                <span className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {change}
                </span>
            </div>
        </div>
    );
};

const TargetSegmentItem = ({ segment }: { segment: TargetSegment }) => {
    return (
        <div className="p-3 bg-white dark:bg-gray-600 rounded-lg">
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">{segment.name}</h4>
                    <div className="flex items-center mt-1">
                        <Users className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{segment.audience.toLocaleString()}</span>
                        <span className="mx-1 text-gray-300">|</span>
                        <Heart className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{segment.engagement}%</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-1">
                        {getPlatformInitial(segment.platform)}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                </div>
            </div>
        </div>
    );
};

const PromotedContentRow = ({ content }: { content: PromotedContent }) => {
    const getPerformanceColor = () => {
        if (content.performance >= 80) return 'text-green-500';
        if (content.performance >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="py-3 px-4">
                <span className="font-medium text-gray-800 dark:text-gray-200">{content.title}</span>
            </td>
            <td className="py-3 px-4">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                    {content.type}
                </span>
            </td>
            <td className="py-3 px-4">
                <div className="flex items-center">
                    <span className={`font-medium ${getPerformanceColor()}`}>{content.performance}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
                </div>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{content.views.toLocaleString()}</td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{content.engagement}%</td>
            <td className="py-3 px-4">
                <div className="flex space-x-2">
                    <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">
                        Booster
                    </button>
                    <button className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                        Détails
                    </button>
                </div>
            </td>
        </tr>
    );
};

const OptimizationCard = ({
    icon,
    title,
    description,
    actionText
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionText: string;
}) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-3">
                {icon}
                <h4 className="font-medium text-gray-800 dark:text-gray-200 ml-2">{title}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                {actionText}
                <ExternalLink className="h-3 w-3 ml-1" />
            </button>
        </div>
    );
};

// Fonction utilitaire pour obtenir l'initiale de la plateforme
const getPlatformInitial = (platform: string): string => {
    switch (platform.toLowerCase()) {
        case 'twitter':
            return 'T';
        case 'linkedin':
            return 'L';
        case 'facebook':
            return 'F';
        case 'instagram':
            return 'I';
        default:
            return 'X';
    }
};

// Données fictives
const campaigns: Campaign[] = [
    {
        id: 1,
        title: "Lancement du guide DeFi 2023",
        status: "active",
        startDate: "10 Juil",
        endDate: "24 Juil",
        budget: "€500",
        reach: 28500,
        conversion: 4.2
    },
    {
        id: 2,
        title: "Webinaire NFT Insights",
        status: "active",
        startDate: "15 Juil",
        endDate: "15 Août",
        budget: "€750",
        reach: 42000,
        conversion: 3.8
    },
    {
        id: 3,
        title: "Promotion Bitcoin Basics",
        status: "paused",
        startDate: "1 Juil",
        endDate: "31 Juil",
        budget: "€350",
        reach: 15200,
        conversion: 2.5
    },
    {
        id: 4,
        title: "Série Ethereum 2.0",
        status: "completed",
        startDate: "15 Juin",
        endDate: "30 Juin",
        budget: "€600",
        reach: 52000,
        conversion: 5.7
    }
];

const targetSegments: TargetSegment[] = [
    {
        id: 1,
        name: "Investisseurs crypto débutants",
        audience: 45000,
        engagement: 4.2,
        platform: "Facebook"
    },
    {
        id: 2,
        name: "Professionnels de la tech",
        audience: 28000,
        engagement: 3.7,
        platform: "LinkedIn"
    },
    {
        id: 3,
        name: "Enthousiastes NFT",
        audience: 12500,
        engagement: 6.8,
        platform: "Twitter"
    }
];

const promotedContent: PromotedContent[] = [
    {
        id: 1,
        title: "Guide complet: Démarrer avec le DeFi en 2023",
        type: "Article",
        performance: 87,
        views: 12400,
        engagement: 5.8
    },
    {
        id: 2,
        title: "Les Smart Contracts expliqués simplement",
        type: "Vidéo",
        performance: 92,
        views: 8750,
        engagement: 7.3
    },
    {
        id: 3,
        title: "10 altcoins à surveiller en 2023",
        type: "Newsletter",
        performance: 76,
        views: 4500,
        engagement: 4.2
    },
    {
        id: 4,
        title: "Problèmes de scalabilité dans la blockchain",
        type: "Webinaire",
        performance: 65,
        views: 3200,
        engagement: 3.8
    }
]; 