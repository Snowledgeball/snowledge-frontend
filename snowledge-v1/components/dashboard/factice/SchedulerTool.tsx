import React from 'react';
import { Calendar, Clock, Plus, BarChart2, Users, CheckCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

// Définition des interfaces
interface ScheduledPost {
    id: number;
    title: string;
    platform: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'scheduled' | 'published' | 'failed' | 'draft';
    engagement?: number;
    author: string;
}

interface EngagementData {
    day: string;
    value: number;
}

export const SchedulerTool = () => {
    const today = new Date();
    const currentMonth = today.toLocaleString('fr-FR', { month: 'long' });
    const currentYear = today.getFullYear();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Planificateur de Publication</h2>
                    <p className="text-gray-600 dark:text-gray-400">Organisez et programmez vos publications sur plusieurs canaux</p>
                </div>
                <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Calendrier de publication</h3>
                        <div className="flex space-x-2">
                            <button className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                                <Filter className="h-4 w-4 mr-1" />
                                Filtrer
                            </button>
                            <button className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                                <Plus className="h-4 w-4 mr-1" />
                                Nouvelle publication
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                    <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 mx-4">{currentMonth} {currentYear}</h4>
                                <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                    <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md">Mois</button>
                                <button className="px-2 py-1 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-md">Semaine</button>
                                <button className="px-2 py-1 text-xs bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 rounded-md">Jour</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                                <div
                                    key={index}
                                    className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }, (_, i) => {
                                const isToday = i === 14;
                                const hasContent = [3, 8, 14, 17, 22, 25, 29].includes(i);
                                const isCurrentMonth = i >= 3 && i <= 33;

                                return (
                                    <div
                                        key={i}
                                        className={`
                                            h-20 p-1 border rounded-lg 
                                            ${isToday ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-600'} 
                                            ${isCurrentMonth ? 'bg-white dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700 opacity-50'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-xs font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {((i - 3 + 1) % 31) || 31}
                                            </span>
                                            {hasContent && (
                                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                                                    {Math.floor(Math.random() * 3) + 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Publications planifiées</h3>
                    <div className="space-y-4">
                        {scheduledPosts.map(post => (
                            <ScheduledPostItem key={post.id} post={post} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Statistiques de publication</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Engagement par jour</h4>
                                <select className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    <option>7 derniers jours</option>
                                    <option>30 derniers jours</option>
                                    <option>3 derniers mois</option>
                                </select>
                            </div>
                            <div className="h-40 w-full flex items-end justify-between space-x-1">
                                {engagementData.map((data, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <div
                                            className="w-8 bg-indigo-500 dark:bg-indigo-600 rounded-t-sm"
                                            style={{ height: `${data.value}%` }}
                                        ></div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{data.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Heures optimales</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Par plateforme</h4>
                                <BarChart2 className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="space-y-4">
                                <OptimalTimeItem platform="Twitter" time="10:00 - 12:00" engagement={28} />
                                <OptimalTimeItem platform="LinkedIn" time="08:00 - 10:00" engagement={35} />
                                <OptimalTimeItem platform="Instagram" time="18:00 - 20:00" engagement={42} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Audiences actives</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Par segment</h4>
                                <Users className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Investisseurs</span>
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mr-2">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">65%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Développeurs</span>
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mr-2">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '42%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">42%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Institutionnels</span>
                                    <div className="flex items-center">
                                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mr-2">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '27%' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">27%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScheduledPostItem = ({ post }: { post: ScheduledPost }) => {
    const getStatusColor = () => {
        switch (post.status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'published':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            default:
                return '';
        }
    };

    const getStatusText = () => {
        switch (post.status) {
            case 'scheduled':
                return 'Programmé';
            case 'published':
                return 'Publié';
            case 'failed':
                return 'Échec';
            case 'draft':
                return 'Brouillon';
            default:
                return '';
        }
    };

    const getPlatformIcon = () => {
        switch (post.platform.toLowerCase()) {
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

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-medium mr-4">
                    {getPlatformIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">{post.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
                            {getStatusText()}
                        </span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center mr-4">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{post.scheduledDate}</span>
                        </div>
                        <div className="flex items-center mr-4">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{post.scheduledTime}</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{post.author}</span>
                        </div>
                        {post.engagement && (
                            <div className="ml-4 flex items-center">
                                <BarChart2 className="h-4 w-4 mr-1" />
                                <span>{post.engagement}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OptimalTimeItem = ({ platform, time, engagement }: { platform: string; time: string; engagement: number }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-medium mr-3">
                    {platform.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{platform}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
                </div>
            </div>
            <div className="flex items-center">
                <span className="text-xs font-medium text-green-600">{engagement}%</span>
                <CheckCircle className="h-4 w-4 text-green-500 ml-1" />
            </div>
        </div>
    );
};

// Données fictives
const scheduledPosts: ScheduledPost[] = [
    {
        id: 1,
        title: "Analyse des tendances crypto pour Q3 2023",
        platform: "Twitter",
        scheduledDate: "14 juil 2023",
        scheduledTime: "10:30",
        status: "scheduled",
        author: "Jean Dupont"
    },
    {
        id: 2,
        title: "Les innovations blockchain de la semaine",
        platform: "LinkedIn",
        scheduledDate: "12 juil 2023",
        scheduledTime: "09:15",
        status: "published",
        engagement: 32,
        author: "Marie Lambert"
    },
    {
        id: 3,
        title: "Guide technique: Smart Contracts expliqués",
        platform: "Facebook",
        scheduledDate: "18 juil 2023",
        scheduledTime: "14:00",
        status: "draft",
        author: "Paul Torres"
    },
    {
        id: 4,
        title: "Rapport mensuel sur l'évolution des altcoins",
        platform: "Twitter",
        scheduledDate: "10 juil 2023",
        scheduledTime: "15:45",
        status: "failed",
        author: "Sophie Martin"
    }
];

const engagementData: EngagementData[] = [
    { day: "L", value: 65 },
    { day: "M", value: 40 },
    { day: "M", value: 85 },
    { day: "J", value: 55 },
    { day: "V", value: 75 },
    { day: "S", value: 35 },
    { day: "D", value: 25 },
]; 