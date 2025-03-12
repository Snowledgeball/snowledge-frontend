"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
  Users,
  MessageCircle,
  TrendingUp,
  Wallet,
  Settings,
  BarChart2,
  FileText,
  ChevronRight,
  Inbox,
  Rss,
  Search,
  Bookmark,
  PinIcon,
  Link2,
  NotebookPen,
  Hash,
  Globe,
  BookMarked,
  ArrowUpRight,
  ImageIcon,
  Eye,
  PenTool,
  Edit,
  MoreVertical,
  UserMinus,
  UserPlus,
  UserX,
} from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { ContributionsChart } from "@/components/shared/ContributionsChart";
import { SubscribersChart } from "@/components/shared/SubscribersChart";
import TinyEditor from "@/components/shared/TinyEditor";
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DashboardData {
  stats: {
    totalMembers: number;
    membersTrend: string;
    totalPosts: number;
    postsTrend: string;
    engagementRate: number;
    engagementTrend: string;
    revenue: string;
    revenueTrend: string;
  };
  recentActivity: {
    id: number;
    type: string;
    text: string;
    author: string;
    authorAvatar?: string;
    engagement: number;
    time: string;
  }[];
  community: {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
  };
}

interface Member {
  id: number;
  fullName: string;
  userName: string;
  profilePicture: string;
  status: "Contributeur" | "Apprenant";
  joinedAt: string | Date | null;
  revisions: number;
  posts: number;
  gains: number;
}

interface ContributorRequest {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  justification: string;
  expertiseDomain: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface RssFeed {
  id: number;
  title: string;
  source: string;
  date: string;
  thumbnail: string;
  category: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  cover_image_url: string | null;
  tag: string;
  status: string;
  created_at: string;
  accept_contributions: boolean;
  user: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
}

const POST_TAGS = [
  { value: "analyse-technique", label: "Analyse Technique" },
  { value: "analyse-macro", label: "Analyse Macro" },
  { value: "defi", label: "DeFi" },
  { value: "news", label: "News" },
  { value: "education", label: "Éducation" },
  { value: "trading", label: "Trading" },
];

export default function CommunityDashboard() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const communityId = params.id;
  const { data: session } = useSession();

  // Récupérer le paramètre tab de l'URL
  const tabParam = searchParams.get('tab');

  // Initialiser l'onglet actif en fonction du paramètre d'URL
  const [activeTab, setActiveTab] = useState(tabParam === "members" ? "members" : "overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();

  const [userId, setUserId] = useState<string | null>(null);
  const [contributorRequests, setContributorRequests] = useState<
    ContributorRequest[]
  >([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [rssFeeds, setRssFeeds] = useState<RssFeed[]>([
    {
      id: 1,
      title: "Bitcoin atteint un nouveau record historique",
      source: "CoinDesk",
      date: "Il y a 2h",
      thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
      category: "Crypto",
    },
    {
      id: 2,
      title: "La Fed maintient ses taux directeurs",
      source: "Bloomberg",
      date: "Il y a 4h",
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
      category: "Macro",
    },
    {
      id: 3,
      title:
        "Ethereum 2.0 : Les développeurs annoncent une mise à jour majeure",
      source: "CryptoNews",
      date: "Il y a 8h",
      thumbnail: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05",
      category: "Crypto",
    },
    {
      id: 4,
      title: "L'inflation en zone euro atteint son plus bas niveau depuis 2021",
      source: "Financial Times",
      date: "Il y a 12h",
      thumbnail: "https://images.unsplash.com/photo-1574607383476-f517f260d30b",
      category: "Macro",
    },
    {
      id: 5,
      title: "Microsoft dévoile sa nouvelle stratégie IA pour 2024",
      source: "TechCrunch",
      date: "Il y a 14h",
      thumbnail: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec",
      category: "Tech",
    },
  ]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editorContent, setEditorContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [contributionsEnabled, setContributionsEnabled] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [selectedMemberToBan, setSelectedMemberToBan] = useState<{
    id: number;
    fullName: string;
  } | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      setUserId(userId);
    }
  }, [session]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/communities/${communityId}`);
        if (response.ok && userId) {
          const data = await response.json();
          if (data.creator_id !== parseInt(userId)) {
            toast.error(
              "Vous n'avez pas les permissions pour accéder à cette page"
            );
            console.log(data.creator_id, userId);
            router.push(`/`);
            return;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchDashboardData();
  }, [userId, communityId, router]);

  const fetchMembers = async () => {
    if (activeTab === "members") {
      try {
        const response = await fetch(`/api/communities/${communityId}/members`);
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des membres:", error);
      }
    }
  };
  useEffect(() => {
    fetchMembers();
  }, [activeTab, communityId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/dashboard`
        );
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error("Erreur lors de la récupération des données");
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && communityId) {
      fetchDashboardData();
    }
  }, [session, communityId]);

  useEffect(() => {
    const fetchContributorRequests = async () => {
      try {
        const response = await fetch(
          `/api/communities/${communityId}/contributor-requests`
        );
        if (response.ok) {
          const data = await response.json();
          setContributorRequests(data.requests);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    if (session?.user && communityId) {
      fetchContributorRequests();
    }
  }, [session, communityId]);

  const handleApproveRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `/api/communities/${communityId}/contributor-requests/${requestId}/approve`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Demande approuvée avec succès");
        // Filtrer la demande approuvée de la liste
        setContributorRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );
      } else {
        toast.error("Erreur lors de l'approbation de la demande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleRejectClick = (requestId: number) => {
    setSelectedRequestId(requestId);
    setIsRejectModalOpen(true);
  };

  const handleRejectRequest = async () => {
    if (!selectedRequestId || !rejectionReason.trim()) return;

    try {
      const response = await fetch(
        `/api/communities/${communityId}/contributor-requests/${selectedRequestId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejection_reason: rejectionReason }),
        }
      );

      if (response.ok) {
        toast.success("Demande refusée");
        setContributorRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequestId ? { ...req, status: "rejected" } : req
          )
        );
        setIsRejectModalOpen(false);
        setRejectionReason("");
        setSelectedRequestId(null);
      } else {
        toast.error("Erreur lors du refus de la demande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const data = await response.json();
      setCoverImage(data.url);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!postTitle || !editorContent || !selectedTag) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (editorContent.length < 100) {
      toast.error("Le contenu doit contenir au moins 100 caractères");
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postTitle,
          content: editorContent,
          cover_image_url: coverImage,
          tag: selectedTag,
          accept_contributions: contributionsEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la publication");
      }

      toast.success("Post publié avec succès");
      // Réinitialiser les champs
      setPostTitle("");
      setEditorContent("");
      setCoverImage("");
      setSelectedTag("");
    } catch (error) {
      toast.error("Erreur lors de la publication du post");
      console.error(error);
    }


  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts`);
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la récupération des posts");
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      fetchPosts();
    }
  }, [activeTab, communityId]);

  const handlePromoteMember = async (memberId: number, memberName: string) => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/members/${memberId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la promotion");

      toast.success(`${memberName} est maintenant contributeur`);
      await fetchMembers();
    } catch (error) {
      toast.error("Erreur lors de la promotion du membre");
    }
  };

  const handleDemoteMember = async (memberId: number, memberName: string) => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/members/${memberId}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la rétrogradation");

      toast.success(`${memberName} n'est plus contributeur`);
      await fetchMembers();
    } catch (error) {
      toast.error("Erreur lors de la rétrogradation du membre");
    }
  };

  const handleExcludeMember = async (memberId: number, memberName: string) => {
    try {
      const response = await fetch(
        `/api/communities/${params.id}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Erreur lors de l'exclusion");

      toast.success(`${memberName} a été exclu`);
      await fetchMembers();
    } catch (error) {
      toast.error("Erreur lors de l'exclusion du membre");
    }
  };

  const handleBanMember = async () => {
    if (!selectedMemberToBan || !banReason.trim()) return;

    try {
      const response = await fetch(
        `/api/communities/${params.id}/members/${selectedMemberToBan.id}/ban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: banReason }),
        }
      );

      if (!response.ok) throw new Error("Erreur lors du bannissement");

      toast.success(`${selectedMemberToBan.fullName} a été banni`);
      await fetchMembers();
      setIsBanModalOpen(false);
      setBanReason("");
      setSelectedMemberToBan(null);
    } catch (error) {
      toast.error("Erreur lors du bannissement du membre");
    }
  };

  useEffect(() => {
    // Mettre à jour l'onglet actif si le paramètre d'URL change
    if (tabParam === "members") {
      setActiveTab("members");
    }
  }, [tabParam]);

  // Fonction pour changer d'onglet et mettre à jour l'URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Mettre à jour l'URL sans recharger la page
    router.push(`/community/${communityId}/dashboard?tab=${tab}`, { scroll: false });
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!dashboardData) {
    return <div>Erreur lors du chargement des données</div>;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Composant Sidebar
  const Sidebar = () => {
    return (
      <div className="w-64 min-h-screen bg-black border-r border-gray-800 rounded-r-3xl shadow-2xl">
        {/* Logo et nom */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 rounded-full">
              {dashboardData?.community?.imageUrl && (
                <Image
                  src={`https://${dashboardData.community.imageUrl}`}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-white">
                {dashboardData.community.name}
              </h2>
              <p
                onClick={() => router.push(`/community/${communityId}`)}
                className="text-xs text-gray-400 hover:underline cursor-pointer"
              >
                Voir la communauté
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-purple-400 text-xs font-medium mb-2">
              Surveillance
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === "overview" ? "bg-gray-800" : "hover:bg-gray-800"}`}
                onClick={() => handleTabChange("overview")}
              >
                📊 Tableau de bord
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === "members" ? "bg-gray-800" : "hover:bg-gray-800"}`}
                onClick={() => handleTabChange("members")}
              >
                👥 Membres
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-purple-400 text-xs font-medium mb-2">
              Création
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === "veille" ? "bg-gray-800" : "hover:bg-gray-800"}`}
                onClick={() => {
                  setActiveTab("veille");
                  toast.error("Cette fonctionnalité n'est pas encore définie");
                }}
              >
                📡 Collecte et veille
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === "creation" ? "bg-gray-800" : "hover:bg-gray-800"}`}
                onClick={() => setActiveTab("creation")}
              >
                ✍️ Création & édition
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${activeTab === "pending" ? "bg-gray-800" : "hover:bg-gray-800"}`}
                onClick={() =>
                  router.push(`/community/${params.id}/posts/pending`)
                }
              >
                📝 Posts en attente
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-purple-400 text-xs font-medium mb-2">
              Communication
            </h3>
            <div className="space-y-1">
              <button
                onClick={() =>
                  toast.info("Cette fonctionnalité n'est pas encore définie")
                }
                className="w-full flex items-center text-white p-2 rounded-lg hover:bg-gray-800"
              >
                💬 Inbox
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-6">
                Bienvenue {session?.user?.name} 👋
              </h1>
              {/* Titre et nom de la communauté plus petit */}
              <div>
                <h2 className="text-xl font-medium">
                  Tableau de bord - {dashboardData.community.name}
                </h2>
                <p className="text-gray-600 pr-2">
                  Aujourd'hui est un bon jour pour partager ton savoir !
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/community/${communityId}/settings`)}
              className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </button>
          </div>

          {/* Contenu principal */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Section Revenus et Audience */}
              <div className="grid grid-cols-2 gap-6">
                {/* Revenus générés */}
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-semibold mb-4">
                    Revenus générés
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">Revenus totaux</p>
                      <p className="text-xl font-bold">
                        {dashboardData.stats.revenue}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">Rev. mensuel</p>
                      <p className="text-xl font-bold">1,250€</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">Rev. par membre</p>
                      <p className="text-xl font-bold">8.50€</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toast.info(
                        "Cette fonctionnalité n'est pas encore définie"
                      )
                    }
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Analyser mes statistiques
                  </button>
                </Card>

                {/* Audience et engagement */}
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-semibold mb-4">
                    Audience et engagement
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">Total membres</p>
                      <p className="text-xl font-bold">
                        {dashboardData.stats.totalMembers}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">Taux d'engagement</p>
                      <p className="text-xl font-bold">
                        {dashboardData.stats.engagementRate}%
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">Posts/semaine</p>
                      <p className="text-xl font-bold">12</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toast.info(
                        "Cette fonctionnalité n'est pas encore définie"
                      )
                    }
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Analyser mes posts
                  </button>
                </Card>
              </div>

              {/* Statistiques détaillées par contenu */}
              <Card className="p-6 rounded-3xl">
                <h3 className="text-lg font-semibold mb-4">
                  Statistiques détaillées par contenu
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-semibold text-gray-600">
                          Titre du contenu
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          Type
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          Vues
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          Engagement
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          Revenus
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">{post.title}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {POST_TAGS.find((t) => t.value === post.tag)
                                ?.label || post.tag}
                            </span>
                          </td>
                          <td className="py-4">
                            {Math.floor(Math.random() * 2000) + 100}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center">
                              {Math.random() > 0.5 ? (
                                <>
                                  <span className="text-green-600">
                                    +{Math.floor(Math.random() * 15) + 1}%
                                  </span>
                                  <TrendingUp className="w-4 h-4 ml-1 text-green-600" />
                                </>
                              ) : (
                                <>
                                  <span className="text-red-600">
                                    -{Math.floor(Math.random() * 10) + 1}%
                                  </span>
                                  <TrendingUp className="w-4 h-4 ml-1 text-red-600 transform rotate-180" />
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            {Math.floor(Math.random() * 100) + 10}€
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Section graphiques */}
              <div className="grid grid-cols-2 gap-6">
                {/* Graphique Contributions */}
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-semibold mb-4">Contributions</h3>
                  <ContributionsChart data={{ active: 65, pending: 35 }} />
                </Card>

                {/* Graphique Évolution des abonnés */}
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-semibold mb-4">
                    Évolution des abonnés
                  </h3>
                  <SubscribersChart
                    data={{
                      labels: [
                        "Jan",
                        "Fév",
                        "Mar",
                        "Avr",
                        "Mai",
                        "Juin",
                        "Juil",
                        "Août",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Déc",
                      ],
                      values: [
                        120, 450, 280, 190, 300, 250, 180, 220, 350, 200, 150,
                        280,
                      ],
                    }}
                  />
                </Card>
              </div>

              {/* Section des posts récents */}
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Posts récents
              </h2>
              <div className="grid gap-6">
                {posts.length === 0 ? (
                  <Card className="p-6 text-center text-gray-500">
                    Aucun post pour le moment
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="p-6 bg-white">
                      <div className="flex items-start space-x-4">
                        {post.cover_image_url && (
                          <div className="flex-shrink-0">
                            <Image
                              src={`https://${post.cover_image_url}`}
                              alt={post.title}
                              width={120}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                              {POST_TAGS.find((t) => t.value === post.tag)
                                ?.label || post.tag}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(
                                  new Date(post.created_at),
                                  {
                                    addSuffix: true,
                                    locale: fr,
                                  }
                                )}
                              </span>
                              {Number(session?.user?.id) === post.user.id && (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/community/${communityId}/posts/${post.id}/edit`
                                    )
                                  }
                                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Image
                                src={post.user.profilePicture}
                                alt={post.user.fullName}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <span className="text-sm text-gray-600">
                                {post.user.fullName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {post.accept_contributions ? (
                                <span className="text-sm text-green-600 flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  Contributions activées
                                </span>
                              ) : (
                                <span className="text-sm text-red-600 flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  Contributions désactivées
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  router.push(
                                    `/community/${communityId}/posts/${post.id}#post-page`
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Voir le post
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              {/* Demandes de contributeurs en attente */}
              {contributorRequests.length > 0 && (
                <Card className="p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Demandes de contributeurs en attente
                  </h3>
                  <div className="space-y-4">
                    {contributorRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg gap-4"
                      >
                        <div className="flex items-center space-x-4">
                          <Image
                            src={request.userAvatar}
                            alt={request.userName}
                            className="w-10 h-10 rounded-full"
                            width={48}
                            height={48}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.userName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {request.expertiseDomain}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 max-w-xl">
                              {request.justification}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 self-end lg:self-auto">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleRejectClick(request.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Liste des membres */}
              <Card className="p-4 lg:p-6 bg-white shadow-sm rounded-3xl overflow-x-auto">
                {members.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Aucun membre trouvé
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Membres de la communauté
                      </h3>
                    </div>

                    {/* Table responsive */}
                    <div className="min-w-full">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="p-4 font-medium w-[300px]">
                              Membre
                            </th>
                            <th className="p-4 font-medium">Statut</th>
                            <th className="p-4 font-medium hidden lg:table-cell">
                              Date d'inscription
                            </th>
                            <th className="p-4 font-medium hidden sm:table-cell">
                              Révisions
                            </th>
                            <th className="p-4 font-medium hidden sm:table-cell">
                              Posts
                            </th>
                            <th className="p-4 font-medium">Gains</th>
                            <th className="p-4 font-medium text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50">
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <Image
                                    src={member.profilePicture}
                                    alt={member.fullName}
                                    className="w-10 h-10 rounded-full"
                                    width={40}
                                    height={40}
                                  />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {member.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      @{member.userName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${member.status === "Contributeur"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                    }`}
                                >
                                  {member.status}
                                </span>
                              </td>
                              <td className="p-4 hidden lg:table-cell">
                                {member.joinedAt
                                  ? new Date(
                                    member.joinedAt
                                  ).toLocaleDateString("fr-FR")
                                  : "Date inconnue"}
                              </td>
                              <td className="p-4 hidden sm:table-cell">
                                {member.revisions}
                              </td>
                              <td className="p-4 hidden sm:table-cell">
                                {member.posts}
                              </td>
                              <td className="p-4 font-medium">
                                {member.gains}€
                              </td>
                              <td className="px-4 py-2 text-right">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer inline-block">
                                      <MoreVertical className="w-4 h-4 text-gray-500" />
                                    </div>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-48" align="end">
                                    {member.status === "Apprenant" ? (
                                      <button
                                        onClick={() =>
                                          handlePromoteMember(
                                            member.id,
                                            member.fullName
                                          )
                                        }
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Promouvoir contributeur</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleDemoteMember(
                                            member.id,
                                            member.fullName
                                          )
                                        }
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      >
                                        <UserMinus className="w-4 h-4" />
                                        <span>Retirer contributeur</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedMemberToBan({
                                          id: member.id,
                                          fullName: member.fullName,
                                        });
                                        setIsBanModalOpen(true);
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <UserX className="w-4 h-4" />
                                      <span>Bannir</span>
                                    </button>
                                  </PopoverContent>
                                </Popover>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Card>
            </div>
          )}

          {activeTab === "veille" && (
            <div className="p-4 lg:p-8">
              {/* En-tête */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold">Collecte et veille</h1>
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                    <Rss className="w-4 h-4 mr-2" />
                    Ajouter un flux RSS
                  </button>
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Link2 className="w-4 h-4 mr-2" />
                    Nouvelle source
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar de gauche */}
                <aside className="w-full lg:w-64 flex flex-col gap-6">
                  {/* Outils de veille */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="font-medium mb-4 flex items-center">
                      <Search className="w-4 h-4 mr-2" />
                      Outils de veille
                    </h3>
                    <div className="flex flex-col gap-2">
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                        <Rss className="w-4 h-4 mr-2" />
                        Flux RSS
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                        <Globe className="w-4 h-4 mr-2" />
                        Sites web
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                        <Hash className="w-4 h-4 mr-2" />
                        Mots-clés
                      </button>
                    </div>
                  </div>

                  {/* Organisation */}
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h3 className="font-medium mb-4 flex items-center">
                      <BookMarked className="w-4 h-4 mr-2" />
                      Organisation
                    </h3>
                    <div className="flex flex-col gap-2">
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Bookmarks
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                        <PinIcon className="w-4 h-4 mr-2" />
                        Épinglés
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center text-gray-700">
                        <NotebookPen className="w-4 h-4 mr-2" />
                        Notes
                      </button>
                    </div>
                  </div>
                </aside>

                {/* Contenu principal */}
                <main className="flex-1">
                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                      <h2 className="text-xl font-semibold">Flux RSS</h2>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>Tous les flux</option>
                          <option>Crypto</option>
                          <option>Macro</option>
                          <option>Tech</option>
                        </select>
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>Plus récents</option>
                          <option>Plus pertinents</option>
                          <option>Plus commentés</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {rssFeeds.map((feed) => (
                        <div
                          key={feed.id}
                          className="flex flex-col sm:flex-row items-start gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={feed.thumbnail}
                              alt={feed.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <span className="text-sm font-medium text-purple-600">
                                {feed.category}
                              </span>
                              <span className="text-sm text-gray-500">
                                {feed.date}
                              </span>
                            </div>
                            <h3 className="font-medium mt-1 mb-2">
                              {feed.title}
                            </h3>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {feed.source}
                              </span>
                              <div className="flex space-x-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                  <Bookmark className="w-4 h-4 text-gray-500" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </main>
              </div>
            </div>
          )}

          {activeTab === "creation" && (
            <div className="flex-1 p-6">
              <div className="flex justify-end items-center mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                    <Switch
                      checked={contributionsEnabled}
                      onCheckedChange={setContributionsEnabled}
                      className="data-[state=checked]:bg-green-600"
                    />
                    <label className="text-gray-600 flex items-center">
                      Contributions
                    </label>
                  </div>

                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2 inline-block" />
                    Prévisualiser
                  </button>

                  <button
                    onClick={handleSubmitPost}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Publier
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6">
                <div className="flex w-full space-x-4">
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="file"
                      id="cover-image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {coverImage ? (
                      <Image
                        src={`https://${coverImage}`}
                        alt="Cover Image"
                        width={75}
                        height={75}
                        className="rounded-lg"
                      />
                    ) : (
                      <label
                        htmlFor="cover-image"
                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-center"
                      >
                        {isUploading
                          ? "Upload..."
                          : "Ajouter une image de couverture"}
                      </label>
                    )}
                    {coverImage && (
                      <label
                        htmlFor="cover-image"
                        className={`px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                      >
                        Modifier
                      </label>
                    )}
                  </div>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg bg-white"
                  >
                    <option defaultValue={POST_TAGS[0].value}>
                      Choisir une catégorie
                    </option>
                    {POST_TAGS.map((tag) => (
                      <option key={tag.value} value={tag.value}>
                        {tag.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Titre de l'article"
                  className="mt-8 w-full text-2xl font-bold border border-gray-200 mb-4 px-4 py-2 rounded-lg"
                />

                <TinyEditor onChange={setEditorContent} />
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Justification du refus</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Veuillez expliquer la raison du refus..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex space-x-2">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleRejectRequest}
              disabled={!rejectionReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer le refus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Prévisualisation du post</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Image de couverture */}
            {coverImage && (
              <div className="w-full h-48 relative mb-6 rounded-lg overflow-hidden">
                <Image
                  src={`https://${coverImage}`}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Tag */}
            {selectedTag && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm mb-4">
                {POST_TAGS.find((t) => t.value === selectedTag)?.label}
              </span>
            )}

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {postTitle || "Sans titre"}
            </h1>

            {/* Contenu */}
            <div id="post-preview-content">
              <style jsx global>{`
                                #post-preview-content h1 {
                                    font-size: 2rem;
                                    font-weight: 700;
                                    margin-top: 1.5rem;
                                    margin-bottom: 1rem;
                                    color: #1f2937;
                                    line-height: 1.3;
                                }
                                #post-preview-content h2 {
                                    font-size: 1.75rem;
                                    font-weight: 700;
                                    margin-top: 1.5rem;
                                    margin-bottom: 1rem;
                                    color: #1f2937;
                                    line-height: 1.3;
                                }
                                #post-preview-content h3 {
                                    font-size: 1.5rem;
                                    font-weight: 600;
                                    margin-top: 1.25rem;
                                    margin-bottom: 0.75rem;
                                    color: #1f2937;
                                }
                                #post-preview-content p {
                                    margin-bottom: 1rem;
                                    line-height: 1.7;
                                    color: #4b5563;
                                }
                                #post-preview-content ul, #post-preview-content ol {
                                    margin-left: 1.5rem;
                                    margin-bottom: 1rem;
                                }
                                #post-preview-content ul {
                                    list-style-type: disc;
                                }
                                #post-preview-content ol {
                                    list-style-type: decimal;
                                }
                                #post-preview-content a {
                                    color: #2563eb;
                                    text-decoration: underline;
                                }
                                #post-preview-content blockquote {
                                    border-left: 4px solid #e5e7eb;
                                    padding-left: 1rem;
                                    font-style: italic;
                                    color: #6b7280;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content img {
                                    max-width: 100%;
                                    height: auto;
                                    border-radius: 0.5rem;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content pre {
                                    background-color: #f3f4f6;
                                    padding: 1rem;
                                    border-radius: 0.5rem;
                                    overflow-x: auto;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content code {
                                    background-color: #f3f4f6;
                                    padding: 0.2rem 0.4rem;
                                    border-radius: 0.25rem;
                                    font-family: monospace;
                                }
                                #post-preview-content table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 1.5rem 0;
                                }
                                #post-preview-content th, #post-preview-content td {
                                    border: 1px solid #e5e7eb;
                                    padding: 0.5rem;
                                }
                                #post-preview-content th {
                                    background-color: #f9fafb;
                                    font-weight: 600;
                                }
                            `}</style>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {contributionsEnabled
                    ? "✅ Contributions activées"
                    : "❌ Contributions désactivées"}
                </span>
                <span>
                  {new Date().toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBanModalOpen} onOpenChange={setIsBanModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Bannir {selectedMemberToBan?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="py-4 ">
            <p className="text-sm text-gray-500 mb-4">
              Cette action est irréversible. Le membre ne pourra plus rejoindre
              la communauté.
            </p>
            <Input
              type="text"
              placeholder="Veuillez expliquer la raison du bannissement..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex space-x-2">
            <button
              onClick={() => {
                setIsBanModalOpen(false);
                setBanReason("");
                setSelectedMemberToBan(null);
              }}
              className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleBanMember}
              disabled={!banReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer le bannissement
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
