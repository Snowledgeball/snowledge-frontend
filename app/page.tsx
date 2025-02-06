"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, MessageCircle, TrendingUp, Search, Clock, Globe, Activity, Shield, Bitcoin, PiggyBank, Wallet
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const CommunityCard = ({
    name,
    members,
    activity,
    trending,
    category,
    lastActive,
    trustScore,
    imageUrl,
    creator
  }: {
    name: string;
    members: number;
    activity: number;
    trending: boolean;
    category: string;
    lastActive: string;
    trustScore: number;
    imageUrl: string;
    creator: {
      name: string;
      avatar: string;
      role: string;
    };
  }) => {
    const getTrustScoreColor = (score: number) => {
      if (score >= 90) return "text-emerald-500";
      if (score >= 75) return "text-blue-500";
      if (score >= 60) return "text-yellow-500";
      return "text-orange-500";
    };

    const getTrustScoreLabel = (score: number) => {
      if (score >= 90) return "Excellent";
      if (score >= 75) return "Très bon";
      if (score >= 60) return "Bon";
      return "Moyen";
    };

    const router = useRouter();

    return (
      <Card
        onClick={() => router.push(`/community/${name}`)}
        className="group relative overflow-hidden bg-white rounded-2xl transition-all duration-300 hover:shadow-xl cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Image de la communauté */}
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
          {trending && (
            <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tendance
            </div>
          )}
        </div>

        <CardContent className="p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {category}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">{name}</h3>
            </div>
          </div>

          {/* Informations du créateur */}
          <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
            <Image
              src={creator.avatar}
              alt={creator.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{creator.name}</p>
              <p className="text-xs text-gray-500">{creator.role}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 text-blue-500 mr-3" />
              <span className="font-medium">{new Intl.NumberFormat("fr-FR").format(members)} membres</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MessageCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="font-medium">{activity} messages/jour</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 text-orange-500 mr-3" />
              <span className="font-medium">Actif {lastActive}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Shield className="w-5 h-5 text-blue-500 mr-3" />
              <div className="flex items-center">
                <span className={`font-medium ${getTrustScoreColor(trustScore)}`}>
                  {trustScore}
                </span>
                <span className="mx-1 text-gray-400">/</span>
                <span className="text-sm text-gray-500">
                  {getTrustScoreLabel(trustScore)}
                </span>
              </div>
            </div>
          </div>

          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Rejoindre
          </button>
        </CardContent>
      </Card>
    );
  };

  const MarketplaceLayout = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [exploreCommunities, setExploreCommunities] = useState<any[]>([]);

    const categories = [
      { id: "all", label: "Toutes les catégories", icon: Globe },
      { id: "crypto", label: "Crypto & Web3", icon: Bitcoin },
      { id: "trading", label: "Trading", icon: TrendingUp },
      { id: "invest", label: "Investissement", icon: PiggyBank },
      { id: "defi", label: "DeFi", icon: Wallet },
    ];

    const featuredCommunities = [
      {
        name: "CryptoMasters France",
        members: 15420,
        activity: 348,
        trending: true,
        category: "Crypto & Web3",
        lastActive: "il y a 5min",
        trustScore: 95,
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040",
        creator: {
          name: "Thomas Dubois",
          avatar: "https://ui-avatars.com/api/?name=Thomas+Dubois&background=random",
          role: "Analyste Crypto & Fondateur"
        }
      },
      {
        name: "Traders Elite",
        members: 8750,
        activity: 245,
        trending: false,
        category: "Trading",
        lastActive: "il y a 15min",
        trustScore: 88,
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
        creator: {
          name: "Sophie Laurent",
          avatar: "https://ui-avatars.com/api/?name=Sophie+Laurent&background=random",
          role: "Trader Professionnelle"
        }
      },
      {
        name: "Investisseurs Long Terme",
        members: 12300,
        activity: 156,
        trending: false,
        category: "Investissement",
        lastActive: "il y a 1h",
        trustScore: 92,
        imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f",
        creator: {
          name: "Marc Lefebvre",
          avatar: "https://ui-avatars.com/api/?name=Marc+Lefebvre&background=random",
          role: "Gestionnaire de portefeuille"
        }
      }
    ];

    const communityTemplates = [
      {
        name: "DeFi Innovators",
        category: "DeFi",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
        creator: { name: "Julie Moreau", role: "DeFi Researcher" }
      },
      {
        name: "Bitcoin & Blockchain FR",
        category: "Crypto & Web3",
        imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
        creator: { name: "Pierre Martin", role: "Expert Blockchain" }
      },
      {
        name: "Options & Futures",
        category: "Trading",
        imageUrl: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29",
        creator: { name: "Alexandre Dupont", role: "Trader Institutionnel" }
      },
      {
        name: "Value Investing Club",
        category: "Investissement",
        imageUrl: "https://images.unsplash.com/photo-1604594849809-dfedbc827105",
        creator: { name: "Marie Bernard", role: "Analyste Financière" }
      },
      {
        name: "ETF & Index",
        category: "Investissement",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        creator: { name: "Emma Rousseau", role: "Conseillère en Investissement" }
      },
      {
        name: "Analyse Technique Pro",
        category: "Trading",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
        creator: { name: "Nicolas Mercier", role: "Analyste Technique" }
      },
      {
        name: "Staking & Yield",
        category: "DeFi",
        imageUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d",
        creator: { name: "Sarah Cohen", role: "DeFi Strategist" }
      },
      {
        name: "Small Caps FR",
        category: "Investissement",
        imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f",
        creator: { name: "Paul Durand", role: "Analyste Small Caps" }
      },
      {
        name: "Trading Algorithmique",
        category: "Trading",
        imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7",
        creator: { name: "Antoine Leroy", role: "Quant Trader" }
      },
      {
        name: "Ethereum France",
        category: "Crypto & Web3",
        imageUrl: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05",
        creator: { name: "Claire Dubois", role: "Développeuse Ethereum" }
      }
    ];

    useEffect(() => {
      const generatedCommunities = Array(12).fill(null).map((_, index) => {
        const template = communityTemplates[index % communityTemplates.length];
        return {
          name: template.name,
          members: Math.floor(Math.random() * 10000) + 1000,
          activity: Math.floor(Math.random() * 300) + 50,
          trending: Math.random() > 0.7,
          category: template.category,
          lastActive: "il y a 2h",
          trustScore: Math.floor(Math.random() * 30) + 65,
          imageUrl: template.imageUrl,
          creator: {
            name: template.creator.name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(template.creator.name)}&background=random`,
            role: template.creator.role
          }
        };
      });
      setExploreCommunities(generatedCommunities);
    }, []);

    const filters = [
      { id: "all", label: "Toutes" },
      { id: "popular", label: "Populaires" },
      { id: "largest", label: "Plus grandes" },
      { id: "new", label: "Nouveautés" },
      { id: "active", label: "Plus actives" },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Explorez les communautés</h1>
            <p className="mt-2 text-gray-600">Découvrez des communautés passionnantes et rejoignez celles qui vous correspondent</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Communautés actives", value: "1,234", icon: Globe },
              { label: "Membres totaux", value: "45,678", icon: Users },
              { label: "Messages aujourd'hui", value: "12,345", icon: MessageCircle },
              { label: "Communautés créées ce mois", value: "123", icon: Activity },
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Section En vedette */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Communautés en vedette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCommunities.map((community, index) => (
                <CommunityCard key={index} {...community} />
              ))}
            </div>
          </section>

          {/* Section Explorer */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Explorer les communautés</h2>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une communauté..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Catégories */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedCategory === id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-8">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Grille des communautés */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {exploreCommunities.map((community, index) => (
                <CommunityCard key={index} {...community} />
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  };

  return <MarketplaceLayout />;
}
