"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  MessageCircle,
  TrendingUp,
  Search,
  Clock,
  Globe,
  Activity,
  Shield,
  Bitcoin,
  PiggyBank,
  Wallet,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";

// Cache pour stocker les données des communautés
const communitiesCache = {
  data: null as Community[] | null,
  timestamp: 0,
  expiresIn: 5 * 60 * 1000, // 5 minutes en millisecondes
};

interface Community {
  id: number;
  name: string;
  members: number;
  activity: number;
  // trending: boolean;
  category: string;
  // lastActive: string;
  // trustScore: number;
  imageUrl: string;
  creator: {
    id: number;
    name: string;
    avatar: string;
  };
  community_learners_id: number[];
  community_contributors_id: number[];
  createdAt: string; // Format ISO date string
  updatedAt: string; // Format ISO date string
}

// Ajout de l'interface pour les données brutes de l'API
interface RawCommunity {
  id: number;
  name: string;
  community_learners: {
    id: number;
    learner_id: number;
    community_id: number;
    joined_at: string;
  }[];
  community_contributors: {
    id: number;
    contributor_id: number;
    community_id: number;
    joined_at: string;
  }[];
  category: {
    label: string;
  };
  image_url: string;
  creator: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
  created_at: string;
  updated_at: string;
}

// Fonction pour récupérer les stats
const fetchStats = async () => {
  try {
    const response = await fetch("/api/stats", {
      next: { revalidate: 3600 }, // Revalider toutes les heures
    });

    if (!response.ok) throw new Error("Erreur réseau");

    return response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
    return null;
  }
};

const HomePage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [stats, setStats] = useState<any>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      setUserId(userId);
    }
  }, [session]);

  useEffect(() => {
    const fetchStatsData = async () => {
      const data = await fetchStats();
      setStats(data.stats);
    };

    fetchStatsData();
  }, [session]);

  // if (!stats) {
  //   return <Loader size="lg" color="gradient" text="Chargement des statistiques..." variant="spinner" />
  // }

  const statsItems = stats
    ? [
      {
        ...stats.communities,
        icon: Globe,
      },
      {
        ...stats.members,
        icon: Users,
      },
      {
        ...stats.enrichments,
        icon: Sparkles,
      },
    ]
    : [];

  const CommunityCard = ({
    id,
    name,
    members,
    // activity,
    // trending,
    category,
    // lastActive,
    // trustScore,
    imageUrl,
    creator,
    community_learners_id,
    community_contributors_id,
  }: {
    id: number;
    name: string;
    members: number;
    activity: number;
    // trending: boolean;
    category: string;
    // lastActive: string;
    // trustScore: number;
    imageUrl: string;
    creator: {
      id: number;
      name: string;
      avatar: string;
    };
    community_learners_id: number[];
    community_contributors_id: number[];
  }) => {
    // const getTrustScoreColor = (score: number) => {
    //   if (score >= 90) return "text-emerald-500";
    //   if (score >= 75) return "text-blue-500";
    //   if (score >= 60) return "text-yellow-500";
    //   return "text-orange-500";
    // };

    // const getTrustScoreLabel = (score: number) => {
    //   if (score >= 90) return "Excellent";
    //   if (score >= 75) return "Très bon";
    //   if (score >= 60) return "Bon";
    //   return "Moyen";
    // };
    return (
      <Card
        onClick={() => router.push(`/community/${id}`)}
        className="group relative overflow-hidden bg-white rounded-2xl transition-all duration-300 hover:shadow-xl cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Image de la communauté */}
        <div className="relative h-48 w-full">
          <Image
            src={"https://" + imageUrl}
            alt={name}
            quality={75}
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
            fill
            className="object-cover rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
          {/* {trending && (
            <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Tendance
            </div>
          )} */}
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
              quality={75}
              loading="eager"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {creator.name}
              </p>
              {/* <p className="text-xs text-gray-500">Créateur</p> */}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 text-blue-500 mr-3" />
              <span className="font-medium">
                {new Intl.NumberFormat("fr-FR").format(members)} membres
              </span>
            </div>
            {/* <div className="flex items-center text-gray-600">
              <MessageCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="font-medium">{activity} messages/jour</span>
            </div> */}
            {/* <div className="flex items-center text-gray-600">
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
            </div> */}
          </div>
          <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {userId
              ? creator.id === parseInt(userId)
                ? "Accéder à votre communauté"
                : community_learners_id.includes(parseInt(userId)) ||
                  community_contributors_id.includes(parseInt(userId))
                  ? "Accéder"
                  : "Rejoindre"
              : "Rejoindre"}
          </button>
        </CardContent>
      </Card>
    );
  };

  const MarketplaceLayout = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
      []
    );
    const [categories, setCategories] = useState<{ id: string, label: string }[]>([
      { id: "all", label: "Toutes les catégories" }
    ]);

    useEffect(() => {
      const fetchCategories = async () => {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories([...categories, ...data]);
      };

      fetchCategories();
    }, []);

    // Fonction pour vérifier si le cache est valide
    const isCacheValid = useMemo(() => {
      return (
        communitiesCache.data !== null &&
        Date.now() - communitiesCache.timestamp < communitiesCache.expiresIn
      );
    }, []);

    const fetchCommunities = async () => {
      try {
        // Vérifier si les données sont dans le cache et si le cache est encore valide
        if (isCacheValid) {
          setCommunities(communitiesCache.data!);
          setLoading(false);
          return;
        }

        const response = await fetch("/api/communities", {
          headers: {
            "Cache-Control": "max-age=300", // Cache de 5 minutes côté serveur
          },
        });

        if (!response.ok)
          throw new Error("Erreur lors de la récupération des communautés");

        const data = await response.json();
        const formattedCommunities = data.map((community: RawCommunity) => ({
          id: community.id,
          name: community.name,
          members: community.community_learners.length,
          activity: Math.floor(Math.random() * 300) + 50,
          trending: Math.random() > 0.7,
          category: community.category.label,
          lastActive: "il y a 2h",
          trustScore: Math.floor(Math.random() * 30) + 65,
          imageUrl:
            community.image_url ||
            "images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop",
          creator: {
            id: community.creator.id,
            name: community.creator.fullName,
            avatar: community.creator.profilePicture,
          },
          community_learners_id: community.community_learners.map(
            (learner) => learner.learner_id
          ),
          community_contributors_id: community.community_contributors.map(
            (contributor) => contributor.contributor_id
          ),
          createdAt: community.created_at,
          updatedAt: community.updated_at,
        }));

        // Mettre à jour le cache
        communitiesCache.data = formattedCommunities;
        communitiesCache.timestamp = Date.now();

        setCommunities(formattedCommunities);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (typeof window === "undefined" || hasFetched.current) {
        setLoading(false);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);

      if (searchParams.get("update")) {
        fetchCommunities();
      } else {
        const cachedData = sessionStorage.getItem("communities");
        if (cachedData) {
          setCommunities(JSON.parse(cachedData));
        } else {
          fetchCommunities();
        }
      }

      hasFetched.current = true;
    }, []); // Pas besoin de dépendances

    const filters = [
      { id: "all", label: "Toutes" },
      { id: "largest", label: "Plus grandes" },
      { id: "new", label: "Nouveautés" },
      // { id: "active", label: "Plus actives" },
    ];

    // Modifier la fonction de filtrage pour prendre en compte les catégories et les filtres
    const filterCommunities = useCallback(() => {
      let filtered = [...communities];

      // Filtrage par terme de recherche
      if (searchTerm.trim()) {
        const searchTermLower = searchTerm.toLowerCase();
        filtered = filtered.filter((community) => {
          return (
            community.name.toLowerCase().includes(searchTermLower) ||
            community.category.toLowerCase().includes(searchTermLower) ||
            community.creator.name.toLowerCase().includes(searchTermLower)
          );
        });
      }

      // Filtrage par catégorie
      if (selectedCategory !== "all") {
        filtered = filtered.filter((community) => {
          return community.category === categories.find((c) => c.id === selectedCategory)?.label;
        });
      }

      // Filtrage par type
      switch (selectedFilter) {
        case "largest":
          filtered.sort((a, b) => b.members - a.members);
          break;
        case "new":
          // Supposons que nous avons un champ createdAt dans notre interface Community
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "active":
          filtered.sort((a, b) => b.activity - a.activity);
          break;
        default:
          // 'all' - pas de tri spécial
          break;
      }

      setFilteredCommunities(filtered);
    }, [communities, searchTerm, selectedCategory, selectedFilter]);

    // Utiliser useEffect pour appliquer les filtres quand les dépendances changent
    useEffect(() => {
      filterCommunities();
    }, [filterCommunities, searchTerm, selectedCategory, selectedFilter]);

    return (
      <div className="min-h-screen">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Explorez les communautés
            </h1>
            <p className="mt-2 text-gray-600">
              Découvrez des communautés passionnantes et rejoignez celles qui
              vous correspondent
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {statsItems.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <h3 className="text-2xl font-semibold mt-1">
                      {typeof item.total === "number"
                        ? item.total.toLocaleString("fr-FR")
                        : item.total}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  {item.icon && <item.icon className="h-8 w-8 text-blue-500" />}
                </div>
              </div>
            ))}
          </div>

          {/* Section En vedette */}
          {/* <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Communautés en vedette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {communities.map((community, index) => (
                <CommunityCard key={index} {...community} />
              ))}
            </div>
          </section> */}

          {/* Section Explorer */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                Explorer les communautés
              </h2>

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
              {categories.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedCategory === id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
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

            {/* Ajouter un indicateur de filtres actifs */}
            {(selectedCategory !== "all" ||
              selectedFilter !== "all" ||
              searchTerm) && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm text-gray-500">Filtres actifs:</span>
                  <div className="flex gap-2">
                    {selectedCategory !== "all" && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                        {categories.find((c) => c.id === selectedCategory)?.label}
                        <button
                          onClick={() => setSelectedCategory("all")}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedFilter !== "all" && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                        {filters.find((f) => f.id === selectedFilter)?.label}
                        <button
                          onClick={() => setSelectedFilter("all")}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {searchTerm && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">
                        Recherche: {searchTerm}
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedFilter("all");
                        setSearchTerm("");
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Réinitialiser tous les filtres
                    </button>
                  </div>
                </div>
              )}

            {/* Grille des communautés */}
            {loading ? (
              <div className="text-center py-12">
                <Loader
                  size="lg"
                  color="gradient"
                  text="Chargement des communautés..."
                  variant="spinner"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCommunities.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Aucune communauté ne correspond à votre recherche
                  </div>
                ) : (
                  filteredCommunities.map((community, index) => (
                    <CommunityCard key={index} {...community} />
                  ))
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  };

  return <MarketplaceLayout />;
};

export default HomePage;
