"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Community } from "@/types/community";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import ChatBox from "@/components/shared/ChatBox";
import QASection from "@/components/shared/QASection";
import VotingSession from "@/components/community/VotingSession";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityBanner from "@/components/community/CommunityBanner";
import CommunityTabs from "@/components/community/CommunityTabs";
import CommunityPosts from "@/components/community/CommunityPosts";
import CommunityPresentationModal from "@/components/community/CommunityPresentationModal";
import BanModal from "@/components/community/BanModal";

// Cache pour stocker les données
const communityCache = new Map<string, any>();
const postsCache = new Map<string, any>();
const pendingPostsCache = new Map<string, any>();
const pendingEnrichmentsCache = new Map<string, any>();

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
  status: string;
}

const CommunityHub = () => {
  const { isLoading, isAuthenticated, LoadingComponent } = useAuthGuard();
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Récupérer l'onglet actif depuis l'URL ou utiliser "general" par défaut
  const tabFromUrl = searchParams.get('tab');

  const [communityData, setCommunityData] = useState<Community | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(tabFromUrl || "general");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isContributor, setIsContributor] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [pendingPostsCount, setPendingPostsCount] = useState(0);
  const [pendingEnrichmentsCount, setPendingEnrichmentsCount] = useState(0);
  const [bans, setBans] = useState<any[]>([]);
  const [votingSubTab, setVotingSubTab] = useState<"creation" | "enrichissement">(
    searchParams.get('voting') as "creation" | "enrichissement" || "creation"
  );
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);

  // Mémoriser l'ID de la communauté pour éviter les re-rendus inutiles
  const communityId = useMemo(() => params.id as string, [params.id]);

  // Mettre à jour l'URL lorsque l'onglet actif change
  const handleTabChange = useCallback((tab: string) => {
    // Éviter de recharger si on clique sur l'onglet déjà actif
    if (tab === activeTab) return;

    setActiveTab(tab);

    // Construire la nouvelle URL avec uniquement le paramètre tab
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);

    // Si on change pour un onglet autre que "voting", supprimer le paramètre "voting"
    if (tab !== "voting") {
      newParams.delete('voting');
    }

    // Mettre à jour l'URL sans recharger la page
    const newUrl = `/community/${communityId}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [activeTab, communityId, searchParams]);

  // Mettre à jour l'URL lorsque le sous-onglet de vote change
  const handleVotingSubTabChange = useCallback((tab: "creation" | "enrichissement") => {
    // Éviter de recharger si on clique sur le sous-onglet déjà actif
    if (tab === votingSubTab) return;

    setVotingSubTab(tab);

    // Construire la nouvelle URL avec les paramètres
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', 'voting');
    newParams.set('voting', tab);

    // Mettre à jour l'URL sans recharger la page
    const newUrl = `/community/${communityId}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  }, [votingSubTab, communityId, searchParams]);

  // Fonction optimisée pour récupérer les posts
  const fetchCommunityPosts = useCallback(async (forceRefresh = false) => {
    if (!communityId || !session) return;

    const cacheKey = `posts-${communityId}`;

    // Vérifier si les données sont dans le cache et si on ne force pas le rafraîchissement
    if (!forceRefresh && postsCache.has(cacheKey)) {
      const cachedData = postsCache.get(cacheKey);
      setPosts(cachedData);
      return;
    }

    setIsLoadingPosts(true);
    try {
      const communityPostsResponse = await fetch(
        `/api/communities/${communityId}/posts?status=PUBLISHED`,
        {
          headers: {
            'Cache-Control': 'max-age=300', // Cache de 5 minutes
          }
        }
      );

      if (!communityPostsResponse.ok)
        throw new Error("Erreur lors de la récupération des posts");

      const data = await communityPostsResponse.json();

      // Mettre en cache les données
      postsCache.set(cacheKey, data);

      setPosts(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [communityId, session]);

  // Fonction optimisée pour récupérer les posts en attente
  const fetchPendingPosts = useCallback(async () => {
    if (!communityId || !session) return;

    const cacheKey = `pending-posts-${communityId}`;

    // Vérifier si les données sont dans le cache et si elles sont récentes (moins de 2 minutes)
    if (pendingPostsCache.has(cacheKey)) {
      const { data, timestamp } = pendingPostsCache.get(cacheKey);
      const now = Date.now();
      if (now - timestamp < 2 * 60 * 1000) { // 2 minutes
        setPendingPostsCount(data.length);
        return;
      }
    }

    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/pending`,
        {
          headers: {
            'Cache-Control': 'max-age=120', // Cache de 2 minutes
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Mettre en cache les données avec un timestamp
        pendingPostsCache.set(cacheKey, { data, timestamp: Date.now() });

        setPendingPostsCount(data.length);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [communityId, session]);

  // Fonction optimisée pour récupérer les enrichissements en attente
  const fetchPendingEnrichments = useCallback(async () => {
    if (!communityId || !session) return;

    const cacheKey = `pending-enrichments-${communityId}`;

    // Vérifier si les données sont dans le cache et si elles sont récentes (moins de 2 minutes)
    if (pendingEnrichmentsCache.has(cacheKey)) {
      const { data, timestamp } = pendingEnrichmentsCache.get(cacheKey);
      const now = Date.now();
      if (now - timestamp < 2 * 60 * 1000) { // 2 minutes
        setPendingEnrichmentsCount(data.length);
        return;
      }
    }

    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/with-pending-enrichments`,
        {
          headers: {
            'Cache-Control': 'max-age=120', // Cache de 2 minutes
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Mettre en cache les données avec un timestamp
        pendingEnrichmentsCache.set(cacheKey, { data, timestamp: Date.now() });

        setPendingEnrichmentsCount(data.length);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [communityId, session]);

  // Fonction principale pour charger les données de la communauté
  const loadCommunityData = useCallback(async () => {
    if (!session || !communityId) return;

    if (userId === null) {
      setUserId(session.user.id);
    }

    setIsLoadingCommunity(true);

    try {
      // Vérifier si les données de la communauté sont dans le cache
      const communityCacheKey = `community-${communityId}`;
      let communityData;

      if (communityCache.has(communityCacheKey)) {
        const { data, timestamp } = communityCache.get(communityCacheKey);
        const now = Date.now();
        if (now - timestamp < 5 * 60 * 1000) { // 5 minutes
          communityData = data;
          setCommunityData(data);
        } else {
          // Les données sont trop anciennes, on les rafraîchit
          const communityResponse = await fetch(`/api/communities/${communityId}`, {
            headers: {
              'Cache-Control': 'max-age=300', // Cache de 5 minutes
            }
          });

          if (!communityResponse.ok) {
            router.push("/404");
            return;
          }

          communityData = await communityResponse.json();
          communityCache.set(communityCacheKey, { data: communityData, timestamp: Date.now() });
          setCommunityData(communityData);
        }
      } else {
        // Pas de données en cache, on les récupère
        const communityResponse = await fetch(`/api/communities/${communityId}`, {
          headers: {
            'Cache-Control': 'max-age=300', // Cache de 5 minutes
          }
        });

        if (!communityResponse.ok) {
          router.push("/404");
          return;
        }

        communityData = await communityResponse.json();
        communityCache.set(communityCacheKey, { data: communityData, timestamp: Date.now() });
        setCommunityData(communityData);
      }

      // Vérifier si l'utilisateur est membre
      const membershipResponse = await fetch(
        `/api/communities/${communityId}/membership`
      );

      const membershipData = await membershipResponse.json();

      // Récupérer les Membres bannis
      const bansResponse = await fetch(`/api/communities/${communityId}/members/${session?.user?.id}/ban`);
      const bansData = await bansResponse.json();
      setBans(bansData);

      // Si l'utilisateur n'est pas membre ou banni, récupérer la présentation
      if (!membershipData.isMember && !membershipData.isCreator && !membershipData.isContributor && bansData.length === 0) {
        const presentationResponse = await fetch(
          `/api/communities/${communityId}/presentation`
        );
        const presentationData = await presentationResponse.json();
        setPresentation(presentationData);
        setShowJoinModal(true);
      }

      // Récupérer les communautés de l'utilisateur (avec mise en cache côté client)
      const userCommunitiesCacheKey = `user-communities-${session?.user?.id}`;
      if (sessionStorage.getItem(userCommunitiesCacheKey)) {
        setUserCommunities(JSON.parse(sessionStorage.getItem(userCommunitiesCacheKey)!));
      } else {
        const userCommunitiesResponse = await fetch(
          `/api/users/${session?.user?.id}/joined-communities`
        );
        if (userCommunitiesResponse.ok) {
          const userCommunitiesData = await userCommunitiesResponse.json();
          setUserCommunities(userCommunitiesData.communities);
          sessionStorage.setItem(userCommunitiesCacheKey, JSON.stringify(userCommunitiesData.communities));
        }
      }

      // Vérifier si l'utilisateur est contributeur
      setIsContributor(membershipData.isContributor);
      setIsCreator(communityData?.creator_id === parseInt(session?.user.id));

      // Si l'utilisateur est contributeur, récupérer le nombre de posts en attente
      if (membershipData.isContributor || membershipData.isCreator) {
        await Promise.all([
          fetchPendingPosts(),
          fetchPendingEnrichments()
        ]);
      }

      // Récupérer les posts de la communauté indépendamment de l'onglet actif
      // pour éviter le rechargement lors du changement d'onglet
      await fetchCommunityPosts();
    } catch (error) {
      if (error instanceof Error) {
        console.log("Erreur:", error.stack);
      } else {
        console.log("Une erreur inattendue s'est produite");
      }
      setUserCommunities([]);
    } finally {
      setIsLoadingCommunity(false);
    }
  }, [communityId, router, session, userId, fetchCommunityPosts, fetchPendingPosts, fetchPendingEnrichments]);

  // Effet pour charger les données initiales
  useEffect(() => {
    if (communityId && session) {
      loadCommunityData();
    }
  }, [communityId, session, loadCommunityData]);

  // Effet pour synchroniser l'état avec l'URL lors des changements de navigation
  useEffect(() => {
    // Fonction pour mettre à jour l'état en fonction des paramètres d'URL
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      const votingFromUrl = params.get('voting') as "creation" | "enrichissement" | null;

      if (tabFromUrl) {
        setActiveTab(tabFromUrl);
      }

      if (votingFromUrl) {
        setVotingSubTab(votingFromUrl);
      }
    };

    // Ajouter l'écouteur d'événements pour les changements d'URL
    window.addEventListener('popstate', handlePopState);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Effet pour surveiller les changements de searchParams et mettre à jour l'état local
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const votingFromUrl = searchParams.get('voting') as "creation" | "enrichissement" | null;

    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }

    if (votingFromUrl && votingFromUrl !== votingSubTab) {
      setVotingSubTab(votingFromUrl);
    }
  }, [searchParams, activeTab, votingSubTab]);

  // Ajouter une fonction pour précharger les données nécessaires pour tous les onglets
  const preloadTabData = useCallback(async () => {
    if (!communityId || !session) return;

    // Précharger les posts pour l'onglet "posts"
    if (posts.length === 0) {
      await fetchCommunityPosts();
    }

    // Précharger d'autres données si nécessaire pour d'autres onglets
    // ...

  }, [communityId, session, posts.length, fetchCommunityPosts]);

  // Ajouter un effet pour précharger les données lors du changement d'onglet
  useEffect(() => {
    preloadTabData();
  }, [activeTab, preloadTabData]);

  // Si en cours de chargement, afficher le loader
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Si non authentifié, ne rien afficher (la redirection est gérée par le hook)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" id="community-page">
      {/* Modal de présentation */}
      <CommunityPresentationModal
        communityData={communityData}
        presentation={presentation}
        userId={userId}
        showModal={showJoinModal}
        setShowModal={setShowJoinModal}
      />

      {/* Modal de bannissement */}
      <BanModal bans={bans} />

      {/* Header avec gradient */}
      <CommunityHeader
        communityData={communityData}
        userCommunities={userCommunities}
        isContributor={isContributor}
        isCreator={isCreator}
        pendingPostsCount={pendingPostsCount}
        pendingEnrichmentsCount={pendingEnrichmentsCount}
        sessionUserId={session?.user?.id}
      />

      {/* Banner section */}
      <CommunityBanner communityData={communityData} />

      {session && (
        <div className="max-w-7xl mx-auto px-4 pb-12" id="community-content">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Contenu principal */}
            <main className="flex-1 order-1">
              {/* Tabs */}
              <CommunityTabs
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                isContributor={isContributor}
                isCreator={isCreator}
                pendingPostsCount={pendingPostsCount}
                pendingEnrichmentsCount={pendingEnrichmentsCount}
              />

              {/* Indicateur de chargement */}
              {isLoadingCommunity && (
                <div className="flex justify-center items-center py-8">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="ml-3 text-blue-600 font-medium">Chargement des données...</p>
                </div>
              )}

              {/* Contenu basé sur l'onglet actif */}
              {!isLoadingCommunity && (
                <>
                  {activeTab === "general" ? (
                    <Card className="bg-white shadow-sm" id="general-section">
                      <div className="h-[600px] flex flex-col">
                        {session && (
                          <ChatBox
                            user={session.user}
                            communityId={parseInt(String(communityId))}
                            className="h-full"
                          />
                        )}
                      </div>
                    </Card>
                  ) : activeTab === "voting" ? (
                    <div id="voting-section">
                      <VotingSession communityId={params.id ? params.id.toString() : ""} />
                    </div>
                  ) : (
                    <div id="posts-section">
                      {isLoadingPosts ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="ml-3 text-blue-600 font-medium">Chargement des posts...</p>
                        </div>
                      ) : (
                        <CommunityPosts
                          posts={posts}
                          communityId={communityId}
                          isContributor={isContributor}
                          userId={session?.user?.id}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>

          {/* Section Q&A avec Disclosure */}
          <div className="mt-8" id="qa-section">
            {activeTab === "general" && session && !isLoadingCommunity && (
              <QASection
                communityId={communityId}
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
