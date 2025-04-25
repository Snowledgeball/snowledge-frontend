"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Workflow,
  Database,
  Gauge,
  Signal,
  Coins,
  BrainCircuit,
  FileCode,
  Wand2,
  CheckCircle,
  CalendarClock,
  BarChart,
  Share2,
  Rocket,
  Sparkles,
  Hammer,
  Repeat,
  Microscope,
  Zap,
  Bot,
  PaintBucket,
  ThumbsUp,
  Palette,
  Lightbulb,
  Clock,
  Calendar,
  Image as ImageLucid,
  Link,
  FileVideo,
  Paperclip,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
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
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ToolSelector } from "@/components/dashboard/ToolSelector";
import { useTranslation } from "react-i18next";
import { TextEditor } from "@/components/shared/TextEditor";
import { useCreateBlockNote } from "@blocknote/react";

// Système de cache pour les données du dashboard
const dashboardCache = {
  dashboardData: new Map<string, { data: any; timestamp: number }>(),
  members: new Map<string, { data: any[]; timestamp: number }>(),
  contributorRequests: new Map<string, { data: any[]; timestamp: number }>(),
  posts: new Map<string, { data: any[]; timestamp: number }>(),
  // Durée de validité du cache (5 minutes)
  expiresIn: 5 * 60 * 1000,
};

// Fonction pour vérifier si le cache est valide
const isCacheValid = (cache: { timestamp: number }) => {
  return Date.now() - cache.timestamp < dashboardCache.expiresIn;
};

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
  community_posts_category: {
    id: number;
    name: string;
    label: string;
  };
}

export default function CommunityDashboard() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const communityId = params.id;
  const { data: session } = useSession();

  // Récupérer le paramètre tab de l'URL
  const tabParam = searchParams.get("tab");

  // Initialiser l'onglet actif en fonction du paramètre d'URL
  const [activeTab, setActiveTab] = useState(tabParam ? tabParam : "overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();

  // Ajout de l'état pour l'outil sélectionné
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

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
  const [selectedTagLabel, setSelectedTagLabel] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [selectedMemberToBan, setSelectedMemberToBan] = useState<{
    id: number;
    fullName: string;
  } | null>(null);
  const [loadingApproval, setLoadingApproval] = useState<number | null>(null);
  const [loadingRejection, setLoadingRejection] = useState(false);
  const [loadingBan, setLoadingBan] = useState(false);
  const [loadingPromote, setLoadingPromote] = useState<number | null>(null);
  const [loadingDemote, setLoadingDemote] = useState<number | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: number; value: string; label: string }>
  >([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewHTML, setPreviewHTML] = useState("");

  // Référence pour accéder aux méthodes de l'éditeur

  const { t } = useTranslation();

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      setUserId(userId);
    }
  }, [session]);

  // const fetchTagNames = async (tagId: string) => {
  //   const response = await fetch(
  //     `/api/communities/${params.id}/categories/${tagId}`
  //   );
  //   const data = await response.json();
  //   setSelectedTag(data.name);
  // };

  // Fetch des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/categories`
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(
            data.map((cat: any) => ({
              id: cat.id,
              value: cat.name,
              label: cat.label,
            }))
          );
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des catégories");
      }
    };
    fetchCategories();
  }, [params.id]);

  // Fonction pour créer une nouvelle catégorie
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/communities/${params.id}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName,
          label: newCategoryLabel,
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [
          ...prev,
          {
            id: newCategory.id,
            value: newCategory.name,
            label: newCategory.label,
          },
        ]);
        setShowCategoryForm(false);
        setNewCategoryName("");
        setNewCategoryLabel("");
        toast.success("Catégorie créée avec succès");
      }
    } catch (error) {
      toast.error("Erreur lors de la création de la catégorie");
    }
  };

  // Fonction pour récupérer les données du dashboard avec cache
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Vérifier si les données sont dans le cache et si le cache est encore valide
      const cacheKey = `dashboard-${communityId}`;
      if (dashboardCache.dashboardData.has(cacheKey)) {
        const cachedData = dashboardCache.dashboardData.get(cacheKey)!;
        if (isCacheValid(cachedData)) {
          setDashboardData(cachedData.data);
          setLoading(false);
          return cachedData.data;
        }
      }

      const response = await fetch(`/api/communities/${communityId}`, {
        headers: {
          "Cache-Control": "max-age=300", // Cache de 5 minutes côté serveur
        },
      });

      if (response.ok && userId) {
        const data = await response.json();
        if (data.creator_id !== parseInt(userId)) {
          toast.error(
            "Vous n'avez pas les permissions pour accéder à cette page"
          );
          router.push(`/`);
          return null;
        }

        // Transformer les données pour correspondre à l'interface DashboardData
        const transformedData: DashboardData = {
          stats: {
            totalMembers: data.community_learners?.length || 0,
            membersTrend: "+5%",
            totalPosts: data.community_posts?.length || 0,
            postsTrend: "+12%",
            engagementRate: 68,
            engagementTrend: "+3%",
            revenue: "1,234€",
            revenueTrend: "+8%",
          },
          recentActivity: data.recent_activity || [],
          community: {
            id: data.id,
            name: data.name,
            description: data.description || "",
            imageUrl: data.image_url,
          },
        };

        // Mettre à jour le cache
        dashboardCache.dashboardData.set(cacheKey, {
          data: transformedData,
          timestamp: Date.now(),
        });

        setDashboardData(transformedData);
        setLoading(false);
        return transformedData;
      } else {
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Erreur:", error);
      setLoading(false);
      return null;
    }
  }, [communityId, userId, router]);

  // Fonction pour récupérer les membres avec cache
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);

      // Vérifier si les données sont dans le cache et si le cache est encore valide
      const cacheKey = `members-${communityId}`;
      if (dashboardCache.members.has(cacheKey)) {
        const cachedData = dashboardCache.members.get(cacheKey)!;
        if (isCacheValid(cachedData)) {
          setMembers(cachedData.data);
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`/api/communities/${communityId}/members`, {
        headers: {
          "Cache-Control": "max-age=300", // Cache de 5 minutes côté serveur
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Mettre à jour le cache
        dashboardCache.members.set(cacheKey, {
          data: data.members,
          timestamp: Date.now(),
        });

        setMembers(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [communityId]);

  // Fonction pour récupérer les demandes de contributeur avec cache
  const fetchContributorRequests = useCallback(async () => {
    try {
      // Vérifier si les données sont dans le cache et si le cache est encore valide
      const cacheKey = `contributor-requests-${communityId}`;
      if (dashboardCache.contributorRequests.has(cacheKey)) {
        const cachedData = dashboardCache.contributorRequests.get(cacheKey)!;
        if (isCacheValid(cachedData)) {
          setContributorRequests(cachedData.data);
          return;
        }
      }

      const response = await fetch(
        `/api/communities/${communityId}/contributor-requests`,
        {
          headers: {
            "Cache-Control": "max-age=300", // Cache de 5 minutes côté serveur
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Mettre à jour le cache
        dashboardCache.contributorRequests.set(cacheKey, {
          data: data.requests,
          timestamp: Date.now(),
        });

        setContributorRequests(data.requests);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [communityId]);

  // Fonction pour récupérer les posts avec cache
  const fetchPosts = useCallback(async () => {
    try {
      // Vérifier si les données sont dans le cache et si le cache est encore valide
      const cacheKey = `posts-${communityId}`;
      if (dashboardCache.posts.has(cacheKey)) {
        const cachedData = dashboardCache.posts.get(cacheKey)!;
        if (isCacheValid(cachedData)) {
          setPosts(cachedData.data);
          return;
        }
      }

      const response = await fetch(`/api/communities/${communityId}/posts`, {
        headers: {
          "Cache-Control": "max-age=300", // Cache de 5 minutes côté serveur
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Mettre à jour le cache
        dashboardCache.posts.set(cacheKey, {
          data: data.posts,
          timestamp: Date.now(),
        });

        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [communityId]);

  // Fonction pour invalider le cache après une modification
  const invalidateCache = useCallback((cacheType: string, key: string) => {
    switch (cacheType) {
      case "dashboardData":
        dashboardCache.dashboardData.delete(key);
        break;
      case "members":
        dashboardCache.members.delete(key);
        break;
      case "contributorRequests":
        dashboardCache.contributorRequests.delete(key);
        break;
      case "posts":
        dashboardCache.posts.delete(key);
        break;
      default:
        // Invalider tous les caches
        dashboardCache.dashboardData.clear();
        dashboardCache.members.clear();
        dashboardCache.contributorRequests.clear();
        dashboardCache.posts.clear();
    }
  }, []);

  // Fonction pour changer d'onglet et mettre à jour l'URL
  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      // Mettre à jour l'URL sans recharger la page
      router.push(`/community/${communityId}/dashboard?tab=${tab}`, {
        scroll: false,
      });
    },
    [communityId, router]
  );

  // Fonction pour gérer le clic sur le bouton de rejet
  const handleRejectClick = useCallback((requestId: number) => {
    setSelectedRequestId(requestId);
    setIsRejectModalOpen(true);
  }, []);

  // Fonction pour gérer l'upload d'image
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    []
  );

  // Fonction pour approuver une demande de contributeur avec invalidation du cache
  const handleApproveRequest = useCallback(
    async (requestId: number) => {
      // Ajouter l'ID de la requête en cours d'approbation
      setLoadingApproval(requestId);

      try {
        const response = await fetch(
          `/api/communities/${communityId}/contributor-requests/${requestId}/approve`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          toast.success("Demande approuvée avec succès");
          // Invalider les caches concernés
          invalidateCache(
            "contributorRequests",
            `contributor-requests-${communityId}`
          );
          invalidateCache("members", `members-${communityId}`);
          // Recharger les données
          fetchContributorRequests();
          fetchMembers();
        } else {
          toast.error("Erreur lors de l'approbation de la demande");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Une erreur est survenue");
      } finally {
        // Réinitialiser l'état de chargement
        setLoadingApproval(null);
      }
    },
    [communityId, fetchContributorRequests, fetchMembers, invalidateCache]
  );

  // Fonction pour rejeter une demande de contributeur avec invalidation du cache
  const handleRejectRequest = useCallback(async () => {
    if (!selectedRequestId) return;

    // Indiquer que le rejet est en cours
    setLoadingRejection(true);

    try {
      const response = await fetch(
        `/api/communities/${communityId}/contributor-requests/${selectedRequestId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        toast.success("Demande rejetée avec succès");
        setIsRejectModalOpen(false);
        // Réinitialiser la raison du rejet
        setRejectionReason("");
        // Invalider le cache des demandes de contributeur
        invalidateCache(
          "contributorRequests",
          `contributor-requests-${communityId}`
        );
        // Recharger les données
        fetchContributorRequests();
      } else {
        toast.error("Erreur lors du rejet de la demande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      // Réinitialiser l'état de chargement
      setLoadingRejection(false);
    }
  }, [
    communityId,
    fetchContributorRequests,
    invalidateCache,
    rejectionReason,
    selectedRequestId,
  ]);

  // Fonction pour soumettre un post avec invalidation du cache
  const handleSubmitPost = useCallback(async () => {
    // Vérification du titre
    if (!postTitle.trim()) {
      setError("Le titre du post est obligatoire");
      return;
    }

    // Vérification du contenu - TextEditor renvoie un objet, pas une chaîne
    if (
      !editorContent ||
      (typeof editorContent === "object" &&
        Object.keys(editorContent).length === 0)
    ) {
      setError("Le contenu du post ne peut pas être vide");
      return;
    }

    // Vérification de l'image
    if (!coverImage) {
      setError("Une image de couverture est requise");
      return;
    }

    // Vérification du tag
    if (!selectedTag) {
      setError("Veuillez sélectionner une catégorie pour votre post");
      return;
    }

    // Si on arrive ici, tout est valide
    setError(null);

    try {
      // Récupérer le HTML complet si la référence de l'éditeur est disponible
      let contentToSave = editorContent;

      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: postTitle,
          content: contentToSave,
          coverImageUrl: coverImage,
          tag: Number(selectedTag),
          acceptContributions: contributionsEnabled,
        }),
      });

      if (response.ok) {
        toast.success("Post créé avec succès");
        setPostTitle("");
        setEditorContent("");
        setCoverImage("");
        setSelectedTag("");
        setContributionsEnabled(false);
        // Invalider le cache des posts
        invalidateCache("posts", `posts-${communityId}`);
        invalidateCache("dashboardData", `dashboard-${communityId}`);
        // Recharger les données
        fetchPosts();
        fetchDashboardData();
      } else {
        toast.error("Erreur lors de la création du post");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    }
  }, [
    postTitle,
    editorContent,
    coverImage,
    selectedTag,
    contributionsEnabled,
    communityId,
    fetchPosts,
    fetchDashboardData,
    invalidateCache,
  ]);

  // Fonction pour promouvoir un membre avec invalidation du cache
  const handlePromoteMember = useCallback(
    async (memberId: number, memberName: string) => {
      // Activer l'indicateur de chargement
      setLoadingPromote(memberId);

      try {
        const response = await fetch(
          `/api/communities/${communityId}/members/${memberId}/promote`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          toast.success(`${memberName} a été promu au rang de contributeur`);
          // Invalider le cache des membres
          invalidateCache("members", `members-${communityId}`);
          // Recharger les données
          fetchMembers();
        } else {
          toast.error("Erreur lors de la promotion du membre");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Une erreur est survenue");
      } finally {
        // Désactiver l'indicateur de chargement
        setLoadingPromote(null);
      }
    },
    [communityId, fetchMembers, invalidateCache]
  );

  // Fonction pour rétrograder un membre avec invalidation du cache
  const handleDemoteMember = useCallback(
    async (memberId: number, memberName: string) => {
      // Activer l'indicateur de chargement
      setLoadingDemote(memberId);

      try {
        const response = await fetch(
          `/api/communities/${communityId}/members/${memberId}/demote`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          toast.success(`${memberName} a été rétrogradé au rang d'apprenant`);
          // Invalider le cache des membres
          invalidateCache("members", `members-${communityId}`);
          // Recharger les données
          fetchMembers();
        } else {
          toast.error("Erreur lors de la rétrogradation du membre");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Une erreur est survenue");
      } finally {
        // Désactiver l'indicateur de chargement
        setLoadingDemote(null);
      }
    },
    [communityId, fetchMembers, invalidateCache]
  );

  // Fonction pour bannir un membre avec invalidation du cache
  const handleBanMember = useCallback(async () => {
    if (!selectedMemberToBan) return;

    // Activer l'indicateur de chargement
    setLoadingBan(true);

    try {
      const response = await fetch(
        `/api/communities/${communityId}/members/${selectedMemberToBan.id}/ban`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: banReason }),
        }
      );

      if (response.ok) {
        toast.success(
          `${selectedMemberToBan.fullName} a été banni de la communauté`
        );
        setIsBanModalOpen(false);
        setBanReason("");
        setSelectedMemberToBan(null);
        // Invalider les caches concernés
        invalidateCache("members", `members-${communityId}`);
        invalidateCache("dashboardData", `dashboard-${communityId}`);
        // Recharger les données
        fetchMembers();
        fetchDashboardData();
      } else {
        toast.error("Erreur lors du bannissement du membre");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Une erreur est survenue");
    } finally {
      // Désactiver l'indicateur de chargement
      setLoadingBan(false);
    }
  }, [
    selectedMemberToBan,
    banReason,
    communityId,
    fetchMembers,
    fetchDashboardData,
    invalidateCache,
  ]);

  useEffect(() => {
    if (communityId && userId) {
      fetchDashboardData();
      fetchMembers();
      fetchContributorRequests();
      fetchPosts();
    }
  }, [
    communityId,
    userId,
    fetchDashboardData,
    fetchMembers,
    fetchContributorRequests,
    fetchPosts,
  ]);

  // Mettre à jour l'onglet actif si le paramètre d'URL change
  useEffect(() => {
    if (tabParam === "members") {
      setActiveTab("members");
    }
  }, [tabParam]);

  // Créer l'éditeur de prévisualisation au niveau racine du composant
  const previewEditor = useCreateBlockNote();

  // Générer le HTML pour la prévisualisation lors de l'ouverture de la modal
  useEffect(() => {
    const renderPreviewHtml = async () => {
      try {
        // Vérifier que le contenu est valide et au format JSON
        if (editorContent && typeof editorContent === "string") {
          // Détecter si c'est déjà du JSON ou juste du HTML
          if (editorContent.trim().startsWith("[")) {
            const blocks = JSON.parse(editorContent);
            const fullHtml = await previewEditor.blocksToFullHTML(blocks);
            setPreviewHTML(fullHtml);
          } else {
            // Si ce n'est pas du JSON, on considère que c'est déjà du HTML
            setPreviewHTML(editorContent);
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la génération du HTML pour la prévisualisation:",
          error
        );
        toast.error("Impossible de générer la prévisualisation");
      }
    };

    if (isPreviewOpen) {
      renderPreviewHtml();
    }
  }, [isPreviewOpen, editorContent, previewEditor]);

  if (loading) {
    return <Loader text={t("loading.data")} fullScreen />;
  }

  if (!dashboardData && !isLoading) {
    return <div>{t("settings.error_loading_settings")}</div>;
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
                {dashboardData?.community?.name}
              </h2>
              <p
                onClick={() => router.push(`/community/${communityId}`)}
                className="text-xs text-gray-400 hover:underline cursor-pointer"
              >
                {t("dashboard.view_community")}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-purple-400 text-xs font-medium mb-2">
              {t("dashboard.monitoring")}
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${
                  activeTab === "overview" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
                onClick={() => {
                  handleTabChange("overview");
                  setSelectedTool(null);
                }}
              >
                📊 {t("dashboard.dashboard")}
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${
                  activeTab === "members" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
                onClick={() => {
                  handleTabChange("members");
                  setSelectedTool(null);
                }}
              >
                👥 {t("profile.members")}
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-purple-400 text-xs font-medium mb-2">
              {t("dashboard.creation")}
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${
                  activeTab === "veille" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
                onClick={() => {
                  setActiveTab("veille");
                  setSelectedTool(null);
                }}
              >
                📡 {t("dashboard.monitoring_collection")}
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
              <button
                className={`w-full flex items-center text-white p-2 rounded-lg ${
                  activeTab === "creation" ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
                onClick={() => {
                  handleTabChange("creation");
                  setSelectedTool(null);
                }}
              >
                ✍️ {t("dashboard.post_creation")}
                <ChevronRight className="ml-auto w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-purple-400 text-xs font-medium mb-2">
              {t("dashboard.toolbox")}
            </h3>
            <div className="space-y-1">
              {/* Outils de collecte */}
              <div className="mb-2">
                <p className="text-gray-500 text-xs pl-2 mb-1">
                  {t("dashboard.collection")}
                </p>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("aggregator");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "aggregator"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Database className="w-4 h-4 mr-2 text-blue-500" />
                  {t("dashboard.tools.source_aggregator")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("trend-scanner");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "trend-scanner"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Gauge className="w-4 h-4 mr-2 text-green-500" />
                  {t("dashboard.tools.trend_scanner")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("sentiment");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "sentiment"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 mr-2 text-yellow-500" />
                  {t("dashboard.tools.sentiment_monitor")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("signals");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "signals"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Signal className="w-4 h-4 mr-2 text-red-500" />
                  {t("dashboard.tools.signal_detector")}
                </button>
              </div>

              {/* Outils d'édition */}
              <div className="mb-2">
                <p className="text-gray-500 text-xs pl-2 mb-1">
                  {t("dashboard.edition")}
                </p>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("collab-editor");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "collab-editor"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Workflow className="w-4 h-4 mr-2 text-indigo-500" />
                  {t("dashboard.tools.collaborative_editor")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("ai-assistant");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "ai-assistant"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <BrainCircuit className="w-4 h-4 mr-2 text-purple-500" />
                  {t("dashboard.tools.ai_writing_assistant")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("templates");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "templates"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <FileCode className="w-4 h-4 mr-2 text-amber-500" />
                  {t("dashboard.tools.template_library")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("fact-checker");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "fact-checker"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  {t("dashboard.tools.fact_checker")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("customizer");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "customizer"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <PaintBucket className="w-4 h-4 mr-2 text-pink-500" />
                  {t("dashboard.tools.visual_customization")}
                </button>
              </div>

              {/* Outils de diffusion */}
              <div>
                <p className="text-gray-500 text-xs pl-2 mb-1">
                  {t("dashboard.distribution")}
                </p>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("scheduler");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "scheduler"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                  {t("dashboard.tools.publication_scheduler")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("analytics");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "analytics"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <BarChart className="w-4 h-4 mr-2 text-cyan-500" />
                  {t("dashboard.tools.realtime_analytics")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("multi-channel");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "multi-channel"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Share2 className="w-4 h-4 mr-2 text-teal-500" />
                  {t("dashboard.tools.multichannel_distribution")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("amplifier");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "amplifier"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Rocket className="w-4 h-4 mr-2 text-rose-500" />
                  {t("dashboard.tools.content_amplifier")}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("tools");
                    setSelectedTool("monetization");
                  }}
                  className={`w-full flex items-center text-white p-2 rounded-lg ${
                    selectedTool === "monetization"
                      ? "bg-gray-800"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <Coins className="w-4 h-4 mr-2 text-amber-500" />
                  {t("dashboard.tools.automatic_monetization")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Composant pour l'interface des outils
  const ToolInterface = () => {
    if (!selectedTool) return null;
    return <ToolSelector selectedTool={selectedTool} />;
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
                {t("dashboard.welcome", { name: session?.user?.name })} 👋
              </h1>
              {/* Titre et nom de la communauté plus petit */}
              <div>
                <h2 className="text-xl font-medium">
                  {t("dashboard.dashboard_title", {
                    name: dashboardData?.community?.name,
                  })}
                </h2>
                <p className="text-gray-600 pr-2">
                  {t("dashboard.good_day_message")}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/community/${communityId}/settings`)}
              className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t("profile.settings")}
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
                    {t("dashboard.generated_revenue")}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">{t("dashboard.total_revenue")}</p>
                      <p className="text-xl font-bold">
                        {dashboardData?.stats?.revenue}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">
                        {t("dashboard.monthly_revenue")}
                      </p>
                      <p className="text-xl font-bold">1,250€</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">
                        {t("dashboard.revenue_per_member")}
                      </p>
                      <p className="text-xl font-bold">8.50€</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toast.info(t("dashboard.feature_not_defined"))
                    }
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {t("dashboard.analyze_stats")}
                  </button>
                </Card>

                {/* Audience et engagement */}
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("dashboard.audience_engagement")}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">{t("dashboard.total_members")}</p>
                      <p className="text-xl font-bold">
                        {dashboardData?.stats?.totalMembers}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">
                        {t("dashboard.engagement_rate")}
                      </p>
                      <p className="text-xl font-bold">
                        {dashboardData?.stats?.engagementRate}%
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-white">
                      <p className="text-sm">{t("dashboard.posts_per_week")}</p>
                      <p className="text-xl font-bold">12</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toast.info(t("dashboard.feature_not_defined"))
                    }
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    {t("dashboard.analyze_posts")}
                  </button>
                </Card>
              </div>

              {/* Statistiques détaillées par contenu */}
              <Card className="p-6 rounded-3xl">
                <h3 className="text-lg font-semibold mb-4">
                  {t("dashboard.detailed_content_stats")}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-semibold text-gray-600">
                          {t("dashboard.content_title")}
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          {t("dashboard.type")}
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          {t("dashboard.views")}
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          {t("dashboard.engagement")}
                        </th>
                        <th className="pb-3 font-semibold text-gray-600">
                          {t("dashboard.revenue")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map((post) => (
                        <tr key={post.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">{post.title}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {post.community_posts_category.label}
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
                  <h3 className="text-lg font-semibold mb-4">
                    {t("voting.contributions")}
                  </h3>
                  <ContributionsChart data={{ active: 65, pending: 35 }} />
                </Card>

                {/* Graphique Évolution des abonnés */}
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("dashboard.subscriber_evolution")}
                  </h3>
                  <SubscribersChart
                    data={{
                      labels: [
                        t("dashboard.months.jan"),
                        t("dashboard.months.feb"),
                        t("dashboard.months.mar"),
                        t("dashboard.months.apr"),
                        t("dashboard.months.may"),
                        t("dashboard.months.jun"),
                        t("dashboard.months.jul"),
                        t("dashboard.months.aug"),
                        t("dashboard.months.sep"),
                        t("dashboard.months.oct"),
                        t("dashboard.months.nov"),
                        t("dashboard.months.dec"),
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
                {t("dashboard.recent_posts")}
              </h2>
              <div className="grid gap-6">
                {posts.length === 0 ? (
                  <Card className="p-6 text-center text-gray-500">
                    {t("community_posts.no_posts")}
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
                              {selectedTag === post.tag ? (
                                <span className="text-green-600">
                                  {post.tag}
                                </span>
                              ) : (
                                post.tag
                              )}
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
                                  {t("community_posts.contributions_enabled")}
                                </span>
                              ) : (
                                <span className="text-sm text-red-600 flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {t("community_posts.contributions_disabled")}
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
                                {t("dashboard.view_post")}
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
                    {t("dashboard.pending_contributor_requests")}
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
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
                            disabled={
                              loadingApproval === request.id || loadingRejection
                            }
                          >
                            {loadingApproval === request.id ? (
                              <>
                                <Loader
                                  size="sm"
                                  className="w-4 h-4 mr-2 animate-spin"
                                />
                                <span>{t("loading.default")}</span>
                              </>
                            ) : (
                              t("voting.approve")
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectClick(request.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
                            disabled={
                              loadingApproval === request.id || loadingRejection
                            }
                          >
                            {loadingRejection &&
                            selectedRequestId === request.id ? (
                              <>
                                <Loader
                                  size="sm"
                                  className="w-4 h-4 mr-2 animate-spin"
                                />
                                <span>{t("loading.default")}</span>
                              </>
                            ) : (
                              t("voting.reject")
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Liste des membres */}
              <Card className="p-4 lg:p-6 bg-white shadow-sm rounded-3xl overflow-x-auto">
                {members && members.length === 0 ? (
                  <div className="text-center text-gray-500">
                    {t("dashboard.no_members_found")}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t("dashboard.community_members")}
                      </h3>
                    </div>

                    {/* Table responsive */}
                    <div className="min-w-full">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="p-4 font-medium w-[300px]">
                              {t("dashboard.member")}
                            </th>
                            <th className="p-4 font-medium">
                              {t("dashboard.status")}
                            </th>
                            <th className="p-4 font-medium hidden lg:table-cell">
                              {t("dashboard.registration_date")}
                            </th>
                            <th className="p-4 font-medium hidden sm:table-cell">
                              {t("dashboard.revisions")}
                            </th>
                            <th className="p-4 font-medium hidden sm:table-cell">
                              {t("profile.posts")}
                            </th>
                            <th className="p-4 font-medium">
                              {t("dashboard.earnings")}
                            </th>
                            <th className="p-4 font-medium text-right">
                              {t("dashboard.actions")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {members &&
                            members.map((member) => (
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
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                      member.status === "Contributeur"
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
                                    <PopoverContent
                                      className="w-48"
                                      align="end"
                                    >
                                      {member.status === "Apprenant" ? (
                                        <button
                                          onClick={() =>
                                            handlePromoteMember(
                                              member.id,
                                              member.fullName
                                            )
                                          }
                                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                          disabled={
                                            loadingPromote === member.id ||
                                            loadingDemote === member.id
                                          }
                                        >
                                          {loadingPromote === member.id ? (
                                            <>
                                              <Loader
                                                size="sm"
                                                className="w-4 h-4 animate-spin"
                                              />
                                              <span>
                                                {t("dashboard.promoting")}
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <UserPlus className="w-4 h-4" />
                                              <span>
                                                {t(
                                                  "dashboard.promote_to_contributor"
                                                )}
                                              </span>
                                            </>
                                          )}
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleDemoteMember(
                                              member.id,
                                              member.fullName
                                            )
                                          }
                                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                          disabled={
                                            loadingPromote === member.id ||
                                            loadingDemote === member.id
                                          }
                                        >
                                          {loadingDemote === member.id ? (
                                            <>
                                              <Loader
                                                size="sm"
                                                className="w-4 h-4 animate-spin"
                                              />
                                              <span>
                                                {t("dashboard.demoting")}
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <UserMinus className="w-4 h-4" />
                                              <span>
                                                {t(
                                                  "dashboard.remove_contributor"
                                                )}
                                              </span>
                                            </>
                                          )}
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
                                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        disabled={
                                          loadingPromote === member.id ||
                                          loadingDemote === member.id
                                        }
                                      >
                                        <UserX className="w-4 h-4" />
                                        <span>{t("dashboard.ban")}</span>
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
                <h1 className="text-2xl font-bold">
                  {t("dashboard.monitoring_collection")}
                </h1>
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                    <Rss className="w-4 h-4 mr-2" />
                    {t("chat.create_channel")}
                  </button>
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Link2 className="w-4 h-4 mr-2" />
                    {t("communities.new_source")}
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
                      {t("dashboard.monitoring_tools")}
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
                      {t("dashboard.organization")}
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
                      <h2 className="text-xl font-semibold">
                        {t("dashboard.rss_feeds")}
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>{t("dashboard.all_feeds")}</option>
                          <option>Crypto</option>
                          <option>Macro</option>
                          <option>Tech</option>
                        </select>
                        <select className="px-3 py-2 border rounded-lg text-sm">
                          <option>{t("dashboard.most_recent")}</option>
                          <option>{t("dashboard.most_relevant")}</option>
                          <option>{t("dashboard.most_commented")}</option>
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
                      {t("voting.contributions")}
                    </label>
                  </div>

                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md flex items-center gap-2"
                  >
                    <Eye size={18} />
                    {t("post_editor.preview")}
                  </button>

                  <button
                    onClick={handleSubmitPost}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t("actions.publish")}
                  </button>
                </div>
              </div>

              {/* Affichage de l'erreur */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

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
                          : t("post_editor.add_cover_image")}
                      </label>
                    )}
                    {coverImage && (
                      <label
                        htmlFor="cover-image"
                        className={`px-4 py-2 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
                          isUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Modifier
                      </label>
                    )}
                  </div>
                  <div className="flex gap-2 items-start">
                    <select
                      value={selectedTag}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedTag(id);
                        // Récupérer le label correspondant à l'ID sélectionné
                        const selectedCategory = categories.find(
                          (cat) => cat.id.toString() === id
                        );
                        if (selectedCategory) {
                          setSelectedTagLabel(selectedCategory.label);
                        }
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="">
                        {t("post_editor.choose_category")}
                      </option>
                      {categories.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                          {tag.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCategoryForm(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder={t("post_editor.article_title")}
                  className="mt-8 w-full text-2xl font-bold border border-gray-200 mb-4 px-4 py-2 rounded-lg"
                />
                <TextEditor value={editorContent} onChange={setEditorContent} />
              </div>
            </div>
          )}

          {activeTab === "tools" && <ToolInterface />}
        </div>
      </div>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{t("dashboard.rejection_justification")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={t("dashboard.explain_rejection_reason")}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loadingRejection}
            >
              {t("actions.cancel")}
            </button>
            <button
              onClick={handleRejectRequest}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[90px]"
              disabled={loadingRejection}
            >
              {loadingRejection ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  <span>{t("loading.default")}</span>
                </>
              ) : (
                t("dashboard.confirm_rejection")
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{t("post_editor.post_preview")}</DialogTitle>
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
                {selectedTagLabel || selectedTag}
              </span>
            )}

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {postTitle || t("post_editor.untitled")}
            </h1>

            {/* Contenu */}
            <div dangerouslySetInnerHTML={{ __html: previewHTML }} />

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {contributionsEnabled
                    ? t("community_posts.contributions_enabled")
                    : t("community_posts.contributions_disabled")}
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
            <DialogTitle>
              {t("dashboard.ban_member", {
                name: selectedMemberToBan?.fullName,
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 ">
            <p className="text-sm text-gray-500 mb-4">
              {t("dashboard.ban_irreversible")}
            </p>
            <Input
              type="text"
              placeholder={t("dashboard.explain_ban_reason")}
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
              disabled={loadingBan}
            >
              {t("actions.cancel")}
            </button>
            <button
              onClick={handleBanMember}
              disabled={!banReason.trim() || loadingBan}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
            >
              {loadingBan ? (
                <>
                  <Loader size="sm" className="w-4 h-4 mr-2 animate-spin" />
                  <span>{t("dashboard.banning")}</span>
                </>
              ) : (
                t("dashboard.confirm_ban")
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {t("dashboard.new_category")}
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t("create_community.category_id_placeholder")}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder={t("create_community.category_name_placeholder")}
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  {t("actions.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {t("actions.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
