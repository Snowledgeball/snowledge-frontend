import React from 'react';
import { TrendingUp, BarChart2, PieChart, Calendar, ChevronDown, Download, Filter, Users, MessageCircle, Eye } from 'lucide-react';

export const AnalyticsTool = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse de Performance</h2>
                    <p className="text-gray-600 dark:text-gray-400">Suivi détaillé de la performance de vos publications</p>
                </div>
                <BarChart2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                        Tous les canaux
                        <ChevronDown className="h-4 w-4 ml-2" />
                    </button>
                    <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Derniers 30 jours
                    </button>
                    <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtres
                    </button>
                </div>
                <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                    title="Portée totale"
                    value="28.5K"
                    change="+12.3%"
                    isPositive={true}
                    icon={<Eye className="h-5 w-5 text-indigo-500" />}
                />
                <MetricCard
                    title="Engagement"
                    value="4.2K"
                    change="+8.7%"
                    isPositive={true}
                    icon={<MessageCircle className="h-5 w-5 text-indigo-500" />}
                />
                <MetricCard
                    title="Taux de conversion"
                    value="3.8%"
                    change="-1.2%"
                    isPositive={false}
                    icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
                />
                <MetricCard
                    title="Nouveaux abonnés"
                    value="845"
                    change="+32.6%"
                    isPositive={true}
                    icon={<Users className="h-5 w-5 text-indigo-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Performance par plateforme</h3>
                        <select className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            <option>Portée</option>
                            <option>Engagement</option>
                            <option>Conversions</option>
                        </select>
                    </div>
                    <div className="h-60 w-full flex items-end justify-between space-x-2 mb-4">
                        <BarChartColumn platform="Twitter" value={65} color="bg-blue-500" />
                        <BarChartColumn platform="LinkedIn" value={78} color="bg-indigo-500" />
                        <BarChartColumn platform="Facebook" value={42} color="bg-purple-500" />
                        <BarChartColumn platform="Instagram" value={55} color="bg-pink-500" />
                        <BarChartColumn platform="TikTok" value={38} color="bg-teal-500" />
                        <BarChartColumn platform="YouTube" value={28} color="bg-red-500" />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Répartition des interactions</h3>
                        <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <PieChartItem label="Likes" value="12.4K" percentage={45} color="bg-blue-500" />
                            <PieChartItem label="Commentaires" value="3.8K" percentage={14} color="bg-indigo-500" />
                            <PieChartItem label="Partages" value="6.2K" percentage={23} color="bg-purple-500" />
                            <PieChartItem label="Clics" value="5.1K" percentage={18} color="bg-pink-500" />
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full border-8 border-blue-500 relative">
                                <div className="w-full h-full rounded-full border-8 border-indigo-500 absolute top-0 left-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0% 45%)' }}></div>
                                <div className="w-full h-full rounded-full border-8 border-purple-500 absolute top-0 left-0" style={{ clipPath: 'polygon(0 45%, 100% 45%, 100% 68%, 0% 68%)' }}></div>
                                <div className="w-full h-full rounded-full border-8 border-pink-500 absolute top-0 left-0" style={{ clipPath: 'polygon(0 68%, 100% 68%, 100% 100%, 0% 100%)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Meilleures publications</h3>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        Voir toutes
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Publication</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plateforme</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Portée</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Engagement</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Taux</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <TopPostRow
                                title="Analyse: Les 5 cryptomonnaies les plus prometteuses pour Q3 2023"
                                date="12 juil 2023"
                                platform="Twitter"
                                reach="12.4K"
                                engagement="3.8K"
                                rate="30.6%"
                            />
                            <TopPostRow
                                title="Guide complet des Smart Contracts: Ce que vous devez savoir"
                                date="8 juil 2023"
                                platform="LinkedIn"
                                reach="8.2K"
                                engagement="1.6K"
                                rate="19.5%"
                            />
                            <TopPostRow
                                title="Webinaire: Comment démarrer avec le DeFi - Inscriptions ouvertes"
                                date="5 juil 2023"
                                platform="Facebook"
                                reach="5.1K"
                                engagement="980"
                                rate="19.2%"
                            />
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recommandations d'optimisation</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <OptimizationCard
                        title="Horaires de publication"
                        description="Augmentez votre portée en publiant entre 18h et 20h en semaine."
                        actionText="Ajuster le planificateur"
                    />
                    <OptimizationCard
                        title="Utilisation des hashtags"
                        description="Ajoutez #blockchain et #investing à vos publications pour +25% d'engagement."
                        actionText="Voir les hashtags recommandés"
                    />
                    <OptimizationCard
                        title="Fréquence de publication"
                        description="Publiez 2 fois de plus par semaine pour une croissance optimale."
                        actionText="Planifier plus de contenu"
                    />
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({
    title,
    value,
    change,
    isPositive,
    icon
}: {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ReactNode;
}) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</h3>
                </div>
                <div className="p-2 bg-white dark:bg-gray-600 rounded-lg">
                    {icon}
                </div>
            </div>
            <div className="mt-2">
                <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {change}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs période précédente</span>
            </div>
        </div>
    );
};

const BarChartColumn = ({ platform, value, color }: { platform: string; value: number; color: string }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="h-40 w-12 bg-gray-200 dark:bg-gray-600 rounded-t-sm relative">
                <div
                    className={`w-12 ${color} rounded-t-sm absolute bottom-0`}
                    style={{ height: `${value}%` }}
                >
                </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{platform}</span>
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{value}%</span>
        </div>
    );
};

const PieChartItem = ({ label, value, percentage, color }: { label: string; value: string; percentage: number; color: string }) => {
    return (
        <div className="flex items-center">
            <div className={`w-3 h-3 ${color} rounded-sm mr-2`}></div>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const TopPostRow = ({
    title,
    date,
    platform,
    reach,
    engagement,
    rate
}: {
    title: string;
    date: string;
    platform: string;
    reach: string;
    engagement: string;
    rate: string;
}) => {
    const getPlatformColor = () => {
        switch (platform.toLowerCase()) {
            case 'twitter':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'linkedin':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
            case 'facebook':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'instagram':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="py-3 px-4 text-sm">
                <span className="font-medium text-gray-800 dark:text-gray-200">{title}</span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{date}</td>
            <td className="py-3 px-4">
                <span className={`text-xs px-2 py-1 rounded-full ${getPlatformColor()}`}>
                    {platform}
                </span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{reach}</td>
            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{engagement}</td>
            <td className="py-3 px-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">{rate}</td>
        </tr>
    );
};

const OptimizationCard = ({
    title,
    description,
    actionText
}: {
    title: string;
    description: string;
    actionText: string;
}) => {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                {actionText}
            </button>
        </div>
    );
}; 