"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Users, MessageCircle, TrendingUp, Shield, Bitcoin, Activity, Award, Wallet, Globe, Plus, ArrowRight, Settings, Mail, Lock, HelpCircle, MessageSquare, FileText, Check, Trophy, DollarSign, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Dialog } from '@headlessui/react';

interface CommunityData {
    name: string;
    role: string;
    joinDate: string;
    contributionsCount: number;
    recentActivity: { type: string; title: string; date: string; engagement: number }[];
    revenue: string;
}

const ProfilePage = () => {
    const { data: session } = useSession();
    const params = useParams();
    const userId = params.id;
    const router = useRouter();

    const userContributions = [
        {
            type: "post",
            title: "L'avenir du Bitcoin en 2024",
            community: "CryptoMasters France",
            date: "Il y a 2 jours",
            engagement: 156,
            reward: "25.5€"
        },
        {
            type: "analysis",
            title: "Analyse technique : ETH/USD",
            community: "Traders Elite",
            date: "Il y a 5 jours",
            engagement: 89,
            reward: "15.2€"
        },
        // ... autres contributions
    ];

    const userCommunities = [
        {
            name: "CryptoMasters France",
            role: "Membre actif",
            joinDate: "Déc 2023",
            contributionsCount: 45,
            recentActivity: [
                { type: "post", title: "L'avenir du Bitcoin en 2024", date: "Il y a 2 jours", engagement: 156 },
                { type: "analysis", title: "Analyse technique : ETH/USD", date: "Il y a 5 jours", engagement: 89 }
            ],
            revenue: "25.5€"
        },
        {
            name: "Traders Elite",
            role: "Analyste vérifié",
            joinDate: "Jan 2024",
            contributionsCount: 23,
            recentActivity: [
                { type: "post", title: "Stratégies de trading", date: "Il y a 1 jour", engagement: 45 },
                { type: "analysis", title: "Analyse des tendances", date: "Il y a 3 jours", engagement: 30 }
            ],
            revenue: "15.2€"
        }
    ];

    const [selectedCommunity, setSelectedCommunity] = useState(userCommunities[0]?.name);
    const selectedCommunityData = userCommunities.find(c => c.name === selectedCommunity) as CommunityData;

    const recommendedCommunities = [
        {
            name: "DeFi Masters",
            description: "Communauté dédiée à la finance décentralisée"
        },
        {
            name: "Trading View FR",
            description: "Analyses techniques et signaux de trading"
        },
        {
            name: "Crypto Analytics",
            description: "Analyses on-chain et fondamentales"
        }
    ];

    // Modifier l'état des onglets pour inclure les nouvelles options
    const [activeTab, setActiveTab] = useState('communities'); // 'communities', 'settings', 'support', 'my-community', 'contributor'

    // Ajoutez l'état pour gérer le modal
    const [isContributorModalOpen, setIsContributorModalOpen] = useState(false);
    const [selectedCommunityForContribution, setSelectedCommunityForContribution] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* En-tête du profil avec fond dégradé */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 transition-all">
                    <div className="flex items-center">
                        <div className="w-24 h-24 bg-white rounded-full mr-6 flex items-center justify-center p-1 ring-4 ring-white/30">
                            <img
                                src="/images/default-avatar.png"
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <div className="text-white">
                            <h1 className="text-3xl font-bold tracking-tight">CryptoPadawan</h1>
                            <div className="flex items-center mt-2 space-x-4">
                                <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                                    <Shield className="w-4 h-4 mr-1" />
                                    Niveau 3
                                </span>
                                <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                                    <Award className="w-4 h-4 mr-1" />
                                    Membre depuis Déc 2023
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: "Communautés", value: "3", icon: Users, color: "text-blue-500" },
                        { label: "Posts", value: "5", icon: MessageCircle, color: "text-green-500" },
                        { label: "Contributions", value: "25", icon: Activity, color: "text-purple-500" },
                        { label: "Gains totaux", value: "129,7€", icon: Wallet, color: "text-amber-500" },
                    ].map((stat, index) => (
                        <Card key={index} className="p-6 bg-white hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color} bg-gray-50`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Navigation principale */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            className={`border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200 
                                ${activeTab === 'communities' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab('communities')}
                        >
                            Communautés
                        </button>
                        <button
                            className={`border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200 
                                ${activeTab === 'my-community' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab('my-community')}
                        >
                            Ma Communauté
                        </button>
                        <button
                            className={`border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200 
                                ${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            Paramètres
                        </button>
                        <button
                            className={`border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200 
                                ${activeTab === 'support' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
                            onClick={() => setActiveTab('support')}
                        >
                            Support
                        </button>
                    </nav>
                </div>

                {/* Contenu principal */}
                <div className="grid grid-cols-3 gap-8">
                    {activeTab === 'communities' && (
                        <>
                            {/* Navigation des communautés (colonne de gauche) */}
                            <div className="space-y-4">
                                {userCommunities.map((community, index) => (
                                    <div
                                        key={index}
                                        className="w-full bg-white rounded-lg p-4 hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div
                                                    onClick={() => setSelectedCommunity(community.name)}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="font-medium text-gray-900">{community.name}</div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {community.role} • Depuis {community.joinDate}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => router.push(`/community/${encodeURIComponent(community.name)}`)}
                                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Accéder
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCommunityForContribution(community.name);
                                                        setIsContributorModalOpen(true);
                                                    }}
                                                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                                >
                                                    Devenir contributeur
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full p-4 rounded-lg bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-2 group"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Rejoindre une nouvelle communauté</span>
                                </button>
                            </div>

                            {/* Contenu de la communauté sélectionnée (colonne centrale) */}
                            <div className="col-span-2 space-y-6">
                                {/* Mes contributions */}
                                <Card className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Mes contributions</h3>
                                    {selectedCommunityData && selectedCommunityData.recentActivity ? (
                                        <div className="space-y-4">
                                            {selectedCommunityData.recentActivity.map((activity, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.type === 'post'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-purple-100 text-purple-700'
                                                                }`}>
                                                                {activity.type}
                                                            </span>
                                                            <h4 className="mt-2 font-medium text-gray-900">{activity.title}</h4>
                                                            <div className="flex items-center mt-2 text-sm text-gray-500">
                                                                <span>{activity.date}</span>
                                                                <span className="mx-2">•</span>
                                                                <span>{activity.engagement} interactions</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Aucune activité récente disponible.</p>
                                    )}
                                </Card>

                                {/* Mes posts */}
                                <Card className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Mes posts</h3>
                                    {selectedCommunityData && selectedCommunityData.recentActivity ? (
                                        <div className="space-y-4">
                                            {selectedCommunityData.recentActivity
                                                .filter(activity => activity.type === 'post')
                                                .map((post, idx) => (
                                                    <div key={idx} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                                                        <div className="flex items-center mt-2 text-sm text-gray-500">
                                                            <span>{post.date}</span>
                                                            <span className="mx-2">•</span>
                                                            <span>{post.engagement} interactions</span>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p>Aucun post disponible.</p>
                                    )}
                                </Card>

                                {/* Revenus générés */}
                                <Card className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenus générés</h3>
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <p className="text-3xl font-bold text-gray-900">{selectedCommunityData?.revenue || "0€"}</p>
                                        <p className="text-sm text-gray-500 mt-1">Revenus totaux de la communauté</p>
                                    </div>
                                </Card>
                            </div>
                        </>
                    )}

                    {activeTab === 'my-community' && (
                        <div className="col-span-3">
                            <div className="text-center py-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Créez votre propre communauté</h3>
                                <p className="text-gray-600 mb-8">Lancez votre communauté et commencez à partager votre expertise</p>
                                <button
                                    onClick={() => router.push('/create-community')}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                                >
                                    Créer une communauté
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                <Card className="p-6 bg-white rounded-xl shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Avantages</h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Créez votre propre espace d'échange
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Monétisez votre expertise
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Construisez une communauté active
                                        </li>
                                    </ul>
                                </Card>
                                <Card className="p-6 bg-white rounded-xl shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités</h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Outils de modération avancés
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Analyses et statistiques
                                        </li>
                                        <li className="flex items-center gap-2 text-gray-600">
                                            <Check className="w-5 h-5 text-green-500" />
                                            Personnalisation complète
                                        </li>
                                    </ul>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="col-span-3">
                            {/* Informations du compte */}
                            <Card className="p-6 bg-white rounded-xl shadow-md">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">Informations du compte</h3>
                                    <button className="text-blue-600 hover:text-blue-700">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Email</p>
                                                <p className="text-sm text-gray-500">user@example.com</p>
                                            </div>
                                        </div>
                                        <button className="text-blue-600 text-sm hover:text-blue-700">Modifier</button>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Lock className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Mot de passe</p>
                                                <p className="text-sm text-gray-500">Dernière modification : il y a 2 mois</p>
                                            </div>
                                        </div>
                                        <button className="text-blue-600 text-sm hover:text-blue-700">Modifier</button>
                                    </div>
                                </div>
                            </Card>

                            {/* Abonnements */}
                            <Card className="p-6 mt-6 bg-white rounded-xl shadow-md">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Mes abonnements</h3>
                                <div className="space-y-4">
                                    {userCommunities.map((community, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{community.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {community.role === "Membre actif"
                                                            ? "Abonnement Premium - Accès illimité"
                                                            : "Abonnement Standard"}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                    Actif
                                                </span>
                                            </div>
                                            <div className="mt-4 space-y-3">
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>Prix mensuel</span>
                                                    <span className="font-medium text-gray-900">29,99€</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>Prochain paiement</span>
                                                    <span>15 avril 2024</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>Statut</span>
                                                    <span className="text-green-600">Actif</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex space-x-2">
                                                    <button className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                                                        Changer de formule
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button className="text-red-600 text-sm hover:text-red-700 font-medium">
                                                        Résilier
                                                    </button>
                                                </div>
                                                <button className="text-gray-600 text-sm hover:text-gray-700 font-medium">
                                                    Voir les détails
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Section pour les offres disponibles */}
                                    <div className="mt-8">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Offres disponibles</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h5 className="font-medium text-blue-900">Pack Découverte</h5>
                                                        <p className="text-sm text-blue-700">Accès à 3 communautés</p>
                                                    </div>
                                                    <span className="text-lg font-bold text-blue-900">49,99€/mois</span>
                                                </div>
                                                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                    Choisir cette offre
                                                </button>
                                            </div>

                                            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h5 className="font-medium text-purple-900">Pack Expert</h5>
                                                        <p className="text-sm text-purple-700">Accès illimité</p>
                                                    </div>
                                                    <span className="text-lg font-bold text-purple-900">89,99€/mois</span>
                                                </div>
                                                <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                                    Choisir cette offre
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="col-span-3">
                            <Card className="p-6 bg-white rounded-xl shadow-md">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Support et Aide</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <HelpCircle className="w-5 h-5 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-900">Centre d'aide</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-5 h-5 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-900">Contacter le support</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-900">FAQ</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Modal de candidature */}
                <Dialog
                    open={isContributorModalOpen}
                    onClose={() => setIsContributorModalOpen(false)}
                    className="relative z-50"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                            {/* En-tête du modal avec dégradé */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                                <div className="flex justify-between items-start">
                                    <div className="text-white">
                                        <h3 className="text-xl font-bold">
                                            Devenir contributeur pour {selectedCommunityForContribution}
                                        </h3>
                                        <p className="mt-2 text-white/80">
                                            Partagez votre expertise et gagnez des récompenses en contribuant à la communauté
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsContributorModalOpen(false)}
                                        className="text-white/80 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Avantages */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl text-center">
                                        <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Trophy className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <h4 className="font-medium text-amber-900 mb-1">Expertise Reconnue</h4>
                                        <p className="text-xs text-amber-700">Gagnez en visibilité dans la communauté</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl text-center">
                                        <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <DollarSign className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h4 className="font-medium text-green-900 mb-1">Récompenses</h4>
                                        <p className="text-xs text-green-700">Monétisez vos contributions</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl text-center">
                                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h4 className="font-medium text-blue-900 mb-1">Communauté</h4>
                                        <p className="text-xs text-blue-700">Rejoignez un réseau d'experts</p>
                                    </div>
                                </div>

                                {/* Formulaire */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pourquoi souhaitez-vous devenir contributeur ?
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                            rows={4}
                                            placeholder="Partagez votre motivation et votre expertise..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Vos domaines d'expertise
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Ex: Trading, Analyse technique, DeFi..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer avec actions */}
                            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsContributorModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        // Logique pour soumettre la candidature
                                        setIsContributorModalOpen(false);
                                    }}
                                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    Envoyer ma candidature
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default ProfilePage; 