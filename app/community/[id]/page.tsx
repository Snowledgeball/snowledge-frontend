"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  PlusCircle,
  FileText,
  Settings,
  ChevronDown,
  Users,
  Lock,
  Edit,
  X,
} from "lucide-react";
import { Community } from "@/types/community";
import Image from "next/image";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ChatBox from "@/components/shared/ChatBox";
import QASection from "@/components/shared/QASection";

// Ajouter ces catégories de posts
const POST_CATEGORIES = [
  { id: "general", label: "Général" },
  { id: "analyse-technique", label: "Analyse technique" },
  { id: "news", label: "News" },
  { id: "reports", label: "Rapports" },
];

// Ajouter ce type avant le composant CommunityHub
type Presentation = {
  video_url?: string;
  topic_details: string;
  code_of_conduct: string;
  disclaimers: string;
};

// Ajouter l'interface Post
interface Post {
  id: number;
  title: string;
  content: string;
  cover_image_url: string | null;
  tag: string;
  created_at: string;
  accept_contributions: boolean;
  user: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
}

const CommunityHub = () => {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [communityData, setCommunityData] = useState<Community | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedPostCategory, setSelectedPostCategory] = useState<
    string | null
  >(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isContributor, setIsContributor] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const [bans, setBans] = useState<any[]>([]);
  useEffect(() => {
    if (!session) {
      return;
    } else if (userId === null) {
      setUserId(session.user.id);
    }

    const checkMembershipAndFetchData = async () => {
      try {
        // Vérifier si l'utilisateur est membre
        const membershipResponse = await fetch(
          `/api/communities/${params.id}/membership`
        );
        const membershipData = await membershipResponse.json();

        // Récupérer les données de la communauté
        const communityResponse = await fetch(`/api/communities/${params.id}`);
        if (!communityResponse.ok) {
          router.push("/404");
          return;
        }
        const communityData = await communityResponse.json();
        setCommunityData(communityData);

        // Récupérer les Membres bannis
        const bansResponse = await fetch(`/api/communities/${params.id}/members/${session?.user?.id}/ban`);
        const bansData = await bansResponse.json();
        console.log("bansData", bansData);
        setBans(bansData);

        // Si l'utilisateur n'est pas membre ou banni, récupérer la présentation
        if (!membershipData.isMember && bansData.length === 0) {
          const presentationResponse = await fetch(
            `/api/communities/${params.id}/presentation`
          );
          const presentationData = await presentationResponse.json();
          setPresentation(presentationData);
          setShowJoinModal(true);
        }

        // Récupérer les communautés de l'utilisateur
        const userCommunitiesResponse = await fetch(
          `/api/users/${session?.user?.id}/joined-communities`
        );
        if (userCommunitiesResponse.ok) {
          const userCommunitiesData = await userCommunitiesResponse.json();
          setUserCommunities(userCommunitiesData.communities);
        }

        // Vérifier si l'utilisateur est contributeur
        setIsContributor(membershipData.isContributor);
        setIsCreator(communityData?.creator_id === parseInt(session?.user.id));

        // Si l'utilisateur est contributeur, récupérer le nombre de posts en attente
        if (membershipData.isContributor) {
          const fetchPendingPosts = async () => {
            try {
              const response = await fetch(
                `/api/communities/${params.id}/posts/pending`
              );
              if (response.ok) {
                const data = await response.json();
                setPendingPostsCount(data.length);
              }
            } catch (error) {
              console.error("Erreur:", error);
            }
          };
          fetchPendingPosts();
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log("Erreur:", error.stack);
        } else {
          console.log("Une erreur inattendue s'est produite");
        }
        setUserCommunities([]);
      }
    };

    if (params.id) {
      checkMembershipAndFetchData();
    }
  }, [params.id, router, session]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `/api/communities/${params.id}/posts?status=PUBLISHED`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de la récupération des posts");
      }
    };

    fetchPosts();
  }, [params.id]);

  const handleJoinCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${params.id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setShowJoinModal(false);
      } else {
        throw new Error("Erreur lors de l'adhésion à la communauté");
      }
    } catch (error) {
      console.error("Erreur:", error);
      // Gérer l'erreur (afficher un message à l'utilisateur)
    }
  };

  // Si en cours de chargement, afficher le loader
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Si non authentifié, ne rien afficher (la redirection est gérée par le hook)
  if (!isAuthenticated) {
    return null;
  }
  const getYoutubeVideoId = (url: string) => {
    const videoId = url.split("v=")[1];
    return videoId;
  };
  // Modifier la fonction de gestion du clic sur une catégorie
  const handleCategoryClick = (categoryId: string) => {
    setSelectedPostCategory(
      selectedPostCategory === categoryId ? null : categoryId
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de présentation */}
      {userId &&
        communityData &&
        communityData?.creator.id !== parseInt(userId) &&
        showJoinModal &&
        presentation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
              {/* En-tête avec gradient */}
              <div className="bg-gradient-radial from-[#003E8A] to-[#16215B] -m-8 mb-6 p-6 rounded-t-xl">
                <h2 className="text-2xl font-bold text-white text-center">
                  {communityData?.name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Colonne de gauche avec la vidéo */}
                <div className="space-y-4">
                  {presentation.video_url && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${getYoutubeVideoId(
                          presentation.video_url
                        )}`}
                        title="Présentation de la communauté"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                {/* Colonne de droite avec les détails */}
                <div
                  className={`space-y-4 ${presentation.video_url ? "col-span-1" : "col-span-2"
                    }`}
                >
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                    <h3 className="font-semibold mb-2 text-gray-900">
                      Vocation de la communauté & détails de la thématique
                    </h3>
                    <p className="text-sm text-gray-600">
                      {presentation.topic_details}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section du bas */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Code de conduite
                  </h3>
                  <p className="text-sm text-gray-600">
                    {presentation.code_of_conduct}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm h-[200px] overflow-y-auto">
                  <h3 className="font-semibold mb-2 text-gray-900">
                    Disclaimer
                  </h3>
                  <p className="text-sm text-gray-600">
                    {presentation.disclaimers}
                  </p>
                </div>
              </div>

              {/* Footer avec checkbox et bouton */}
              <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">
                    J&apos;ai compris et j&apos;accepte le code de conduite
                  </span>
                </label>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleJoinCommunity}
                    disabled={!hasAcceptedTerms}
                    className={`px-6 py-2 rounded-lg transition-colors ${hasAcceptedTerms
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    Rejoindre la communauté →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {bans.length > 0 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="bg-red-100 inline-flex p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Accès refusé
              </h2>
              <p className="text-gray-600 mb-4">
                Vous avez été banni de cette communauté
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Motif du bannissement :</h3>
              <p className="text-gray-600 italic">
                "{bans[0].reason}"
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Retour à la page d'accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header avec gradient */}
      {communityData && (
        <div
          id="no-header"
          className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#003E8A] to-[#16215B]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="text-white/80 hover:text-white mr-4 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {/* Menu déroulant des communautés */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white">
                    <h1 className="text-xl font-bold">{communityData.name}</h1>
                    {isContributor && pendingPostsCount > 0 && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                        {pendingPostsCount} en attente
                      </span>
                    )}
                    <ChevronDown className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                  </button>

                  {/* Liste déroulante des communautés */}
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-2">
                      {userCommunities &&
                        userCommunities.map((community) => (
                          <button
                            key={community.id}
                            onClick={() =>
                              router.push(`/community/${community.id}`)
                            }
                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors
                                                    ${String(community.id) ===
                                params.id
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                              }`}
                          >
                            <div>
                              <div className="font-medium">
                                {community.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {community.role === "learner"
                                  ? "Apprenant"
                                  : "Contributeur"}
                              </div>
                            </div>
                          </button>
                        ))}

                      {/* Séparateur */}
                      <div className="h-px bg-gray-200 my-2" />

                      {/* Lien pour découvrir plus de communautés */}
                      <button
                        onClick={() => router.push("/")}
                        className="w-full flex items-center justify-between p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <span className="text-sm font-medium">
                          Découvrir plus de communautés
                        </span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {session &&
                communityData?.creator.id === parseInt(session?.user?.id) && (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        router.push(`/community/${params.id}/settings`)
                      }
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Banner section */}
      {communityData && (
        <>
          <div className="w-full h-[255px] relative overflow-hidden">
            <Image
              src={`https://${communityData?.image_url}`}
              alt="Banner pattern"
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="flex items-center justify-center flex-col py-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {communityData?.name}
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Créé par {communityData?.creator.fullName}
            </p>
          </div>
        </>
      )}

      {session && (
        <div className="max-w-7xl mx-auto px-4 pb-12 ">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar gauche - Supprimée car plus nécessaire */}

            {/* Contenu principal */}
            <main className="flex-1 order-1">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex justify-center space-x-8">
                  <button
                    className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === "general"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    onClick={() => setActiveTab("general")}
                  >
                    Général
                  </button>
                  <button
                    className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === "posts"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    onClick={() => setActiveTab("posts")}
                  >
                    Les posts
                  </button>
                  {/* Bouton Cours verrouillé */}
                  <button
                    onClick={() =>
                      toast.info(
                        "Les cours ne sont pas encore disponibles. Revenez bientôt !"
                      )
                    }
                    className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors opacity-60 cursor-not-allowed flex items-center gap-2
                                        ${activeTab === "courses"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500"
                      }`}
                  >
                    Cours
                    <Lock className="w-4 h-4" />
                  </button>
                  {isContributor && (
                    <button
                      className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === "pending"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      onClick={() =>
                        router.push(`/community/${params.id}/posts/pending`)
                      }
                    >
                      Posts en attente
                    </button>
                  )}
                </nav>
              </div>

              {/* Chat Area */}
              {activeTab === "general" ? (
                <Card className="bg-white shadow-sm">
                  <div className="h-[600px] flex flex-col">
                    {session && (
                      <ChatBox
                        user={session.user}
                        communityId={parseInt(String(params.id))}
                        className="h-full"
                      />
                    )}
                  </div>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Bouton Nouveau Post pour les contributeurs */}
                  <div className="flex justify-end">
                    {isContributor && (
                      <button
                        onClick={() =>
                          router.push(`/community/${params.id}/posts/create`)
                        }
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Proposer un post</span>
                      </button>
                    )}
                  </div>

                  {/* Posts groupés par catégories */}
                  {POST_CATEGORIES.map((category) => {
                    const categoryPosts = posts.filter(
                      (post) => post.tag === category.id
                    );
                    if (categoryPosts.length === 0) return null;
                    return (
                      <div
                        key={category.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        {/* En-tête de la catégorie */}
                        <div className="border-b border-gray-100">
                          <button
                            onClick={() => handleCategoryClick(category.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <h3 className="font-medium text-gray-900">
                                {category.label}
                              </h3>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                {categoryPosts.length}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-gray-400 transition-transform ${selectedPostCategory === category.id
                                ? "rotate-180"
                                : ""
                                }`}
                            />
                          </button>
                        </div>

                        {/* Liste des posts de la catégorie */}
                        {selectedPostCategory === category.id &&
                          categoryPosts && (
                            <div className="divide-y divide-gray-100">
                              {categoryPosts.map((post) => (
                                <div
                                  key={post.id}
                                  className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                      <Image
                                        src={post.user.profilePicture}
                                        alt={post.user.fullName}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                      />
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {post.user.fullName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {formatDistanceToNow(
                                            new Date(post.created_at),
                                            {
                                              addSuffix: true,
                                              locale: fr,
                                            }
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    {Number(session?.user?.id) ===
                                      post.user.id && (
                                        <button
                                          onClick={() =>
                                            router.push(
                                              `/community/${params.id}/posts/${post.id}/edit`
                                            )
                                          }
                                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                      )}
                                  </div>

                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    {post.title}
                                  </h4>

                                  {/* Image de couverture */}
                                  {post.cover_image_url && (
                                    <div className="mb-3 rounded-lg overflow-hidden">
                                      <Image
                                        src={`https://${post.cover_image_url}`}
                                        alt={post.title}
                                        width={800}
                                        height={400}
                                        className="w-full h-[200px] object-cover"
                                      />
                                    </div>
                                  )}

                                  <div className="prose prose-sm max-w-none text-gray-600 mb-3 max-h-[300px] overflow-hidden relative">
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: post.content,
                                      }}
                                      className="line-clamp-[12] p-6"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                                  </div>
                                  <div className="flex items-center justify-between">
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
                                          `/community/${params.id}/posts/${post.id}#post-page`
                                        )
                                      }
                                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                      Lire la suite →
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>

          {/* Section Q&A avec Disclosure */}
          <div className="mt-8">
            {activeTab === "general" && session && (
              <QASection
                communityId={params.id as string}
                isContributor={isContributor}
                isCreator={isCreator}
                userId={session?.user?.id}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;
