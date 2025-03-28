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
import { Loader } from "@/components/ui/loader";
import React from "react";
import { usePusher } from "@/contexts/PusherContext";

// Cache pour stocker les données
// Nous n'utilisons plus ces Maps car elles sont réinitialisées à chaque rechargement
// const communityCache = new Map<string, { data: any, timestamp: number }>();
// const postsCache = new Map<string, any>();
// const pendingPostsCache = new Map<string, any>();
// const pendingEnrichmentsCache = new Map<string, any>();

// Fonctions utilitaires pour le cache avec localStorage
const cacheUtils = {
  // Récupérer des données du cache
  get: (key: string) => {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsedItem = JSON.parse(item);
      return parsedItem;
    } catch (error) {
      console.error("Erreur lors de la récupération du cache:", error);
      return null;
    }
  },

  // Stocker des données dans le cache
  set: (key: string, data: any, expirationInMinutes = 5) => {
    if (typeof window === "undefined") return;

    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + expirationInMinutes * 60 * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Erreur lors du stockage dans le cache:", error);
    }
  },

  // Vérifier si une clé existe dans le cache et n'est pas expirée
  has: (key: string) => {
    if (typeof window === "undefined") return false;

    try {
      const item = localStorage.getItem(key);
      if (!item) return false;

      const parsedItem = JSON.parse(item);
      return parsedItem && parsedItem.expiration > Date.now();
    } catch (error) {
      console.error("Erreur lors de la vérification du cache:", error);
      return false;
    }
  },

  // Supprimer une entrée du cache
  remove: (key: string) => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
    }
  },
};

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
  const { client } = usePusher();

  // Récupérer l'onglet actif depuis l'URL ou utiliser "general" par défaut
  const tabFromUrl = searchParams.get("tab");

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
  const [votingSubTab, setVotingSubTab] = useState<
    "creation" | "enrichissement"
  >(
    (searchParams.get("voting") as "creation" | "enrichissement") || "creation"
  );
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingGeneral, setIsLoadingGeneral] = useState(true);
  const [isMember, setIsMember] = useState(false);

  // Mémoriser l'ID de la communauté pour éviter les re-rendus inutiles
  const communityId = useMemo(() => params.id as string, [params.id]);

  // Mettre à jour l'URL lorsque l'onglet actif change
  const handleTabChange = useCallback(
    (tab: string) => {
      // Éviter de recharger si on clique sur l'onglet déjà actif
      if (tab === activeTab) return;

      setActiveTab(tab);

      // Construire la nouvelle URL avec uniquement le paramètre tab
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("tab", tab);

      // Si on change pour un onglet autre que "voting", supprimer le paramètre "voting"
      if (tab !== "voting") {
        newParams.delete("voting");
      }

      // Mettre à jour l'URL sans recharger la page
      const newUrl = `/community/${communityId}?${newParams.toString()}`;
      window.history.pushState({}, "", newUrl);
    },
    [activeTab, communityId, searchParams]
  );

  // Fonction pour invalider le cache
  const invalidateCache = useCallback((cacheKey: string) => {
    cacheUtils.remove(cacheKey);
  }, []);

  // Fonction optimisée pour récupérer les posts
  const fetchCommunityPosts = useCallback(
    async (forceRefresh = false, noLoading = false) => {
      if (!communityId || !session) return;

      const cacheKey = `posts-${communityId}`;

      // Vérifier si les données sont dans le cache et si on ne force pas le rafraîchissement
      if (!forceRefresh && cacheUtils.has(cacheKey)) {
        console.log("posts already in cache");
        const cachedData = cacheUtils.get(cacheKey);
        setPosts(cachedData.data);

        // On fetch quand meme pour s'assurer que les données sont bien à jour
        fetchCommunityPosts(true, true);
        return;
      }

      console.log("Fetching posts");

      if (!noLoading) {
        setIsLoadingPosts(true);
      }
      try {
        console.log("Forced fetching posts");
        const communityPostsResponse = await fetch(
          `/api/communities/${communityId}/posts?status=PUBLISHED`
        );

        if (!communityPostsResponse.ok)
          throw new Error("Erreur lors de la récupération des posts");

        const data = await communityPostsResponse.json();

        // Vérifier que les données sont bien un tableau
        const postsData = Array.isArray(data.posts) ? data.posts : [];

        // Mettre en cache les données
        cacheUtils.set(cacheKey, postsData, 2);

        setPosts(postsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error);
        setPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    },
    [communityId, session]
  );

  // Fonction optimisée pour récupérer les posts en attente
  const fetchPendingPosts = useCallback(async () => {
    if (!communityId || !session) return;

    const cacheKey = `pending-posts-${communityId}`;

    // Vérifier si les données sont dans le cache et si elles sont récentes
    if (cacheUtils.has(cacheKey)) {
      const cachedData = cacheUtils.get(cacheKey);
      setPendingPostsCount(cachedData.data.length);
      return;
    }

    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/pending`,
        {
          headers: {
            "Cache-Control": "max-age=120", // Cache de 2 minutes
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Mettre en cache les données
        cacheUtils.set(cacheKey, data, 2); // 2 minutes d'expiration

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

    // Vérifier si les données sont dans le cache
    if (cacheUtils.has(cacheKey)) {
      const cachedData = cacheUtils.get(cacheKey);
      setPendingEnrichmentsCount(cachedData.data.length);
      return;
    }

    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/with-pending-enrichments`,
        {
          headers: {
            "Cache-Control": "max-age=120", // Cache de 2 minutes
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Mettre en cache les données
        cacheUtils.set(cacheKey, data, 2); // 2 minutes d'expiration

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

    setIsLoadingGeneral(true);

    try {
      // Vérifier si les données de la communauté sont dans le cache
      const communityCacheKey = `community-${communityId}`;
      let communityData;

      if (cacheUtils.has(communityCacheKey)) {
        const cachedData = cacheUtils.get(communityCacheKey);

        if (cachedData) {
          communityData = cachedData.data;
          setCommunityData(cachedData.data);
        } else {
          // Les données sont trop anciennes ou invalides, on les rafraîchit
          const communityResponse = await fetch(
            `/api/communities/${communityId}`,
            {
              headers: {
                "Cache-Control": "max-age=120", // Cache de 2 minutes
              },
            }
          );

          if (!communityResponse.ok) {
            router.push("/404");
            return;
          }

          communityData = await communityResponse.json();
          cacheUtils.set(communityCacheKey, communityData, 2);
          setCommunityData(communityData);
        }
      } else {
        // Pas de données en cache, on les récupère
        const communityResponse = await fetch(
          `/api/communities/${communityId}`,
          {
            headers: {
              "Cache-Control": "max-age=120", // Cache de 2 minutes
            },
          }
        );

        if (!communityResponse.ok) {
          router.push("/404");
          return;
        }

        communityData = await communityResponse.json();
        cacheUtils.set(communityCacheKey, communityData, 2);
        setCommunityData(communityData);
      }

      // Vérifier si l'utilisateur est membre
      const membershipResponse = await fetch(
        `/api/communities/${communityId}/membership`
      );

      const membershipData = await membershipResponse.json();

      // Mettre à jour l'état d'adhésion
      setIsMember(
        membershipData.isMember ||
          membershipData.isCreator ||
          membershipData.isContributor
      );

      // Récupérer les Membres bannis
      const bansResponse = await fetch(
        `/api/communities/${communityId}/members/${session?.user?.id}/ban`
      );
      const bansData = await bansResponse.json();
      setBans(bansData);

      // Si l'utilisateur n'est pas membre ou banni, récupérer la présentation
      if (
        !membershipData.isMember &&
        !membershipData.isCreator &&
        !membershipData.isContributor &&
        bansData.length === 0
      ) {
        const presentationResponse = await fetch(
          `/api/communities/${communityId}/presentation`
        );
        const presentationData = await presentationResponse.json();
        setPresentation(presentationData);
        setShowJoinModal(true);
      }

      // Récupérer les communautés de l'utilisateur (avec mise en cache côté client)
      const userCommunitiesCacheKey = `user-communities-${session?.user?.id}`;

      try {
        // Fonction pour récupérer les communautés depuis l'API
        const fetchFromAPI = async () => {
          const joinedCommunitiesResponse = await fetch(
            `/api/users/${session?.user?.id}/joined-communities`
          );
          const ownedCommunitiesResponse = await fetch(
            `/api/users/${session?.user?.id}/owned-communities`
          );

          if (!joinedCommunitiesResponse.ok || !ownedCommunitiesResponse.ok) {
            throw new Error(
              `Erreur HTTP: ${joinedCommunitiesResponse.status} ${ownedCommunitiesResponse.status}`
            );
          }

          const joinedCommunities = await joinedCommunitiesResponse.json();
          const ownedCommunities = await ownedCommunitiesResponse.json();

          const formattedOwnedCommunities = ownedCommunities.communities.map(
            (community: any) => ({
              id: community.id,
              name: community.name,
              createdAt: community.created_at,
              role: "creator",
            })
          );

          if (
            joinedCommunities &&
            joinedCommunities.communities &&
            Array.isArray(joinedCommunities.communities) &&
            formattedOwnedCommunities &&
            Array.isArray(formattedOwnedCommunities)
          ) {
            const allCommunities = joinedCommunities.communities.concat(
              formattedOwnedCommunities
            );
            setUserCommunities(allCommunities);

            // Sauvegarder dans sessionStorage
            if (typeof window !== "undefined") {
              sessionStorage.setItem(
                userCommunitiesCacheKey,
                JSON.stringify(allCommunities)
              );
            }

            return allCommunities;
          } else {
            setUserCommunities([]);
            return [];
          }
        };

        // Vérifier si des données sont en cache
        if (
          typeof window !== "undefined" &&
          sessionStorage.getItem(userCommunitiesCacheKey)
        ) {
          try {
            const cachedDataStr = sessionStorage.getItem(
              userCommunitiesCacheKey
            );

            if (cachedDataStr) {
              const cachedData = JSON.parse(cachedDataStr);
              if (Array.isArray(cachedData) && cachedData.length > 0) {
                setUserCommunities(cachedData);
              } else {
                await fetchFromAPI();
              }
            } else {
              await fetchFromAPI();
            }
          } catch (error) {
            console.error("Erreur lors de la lecture du cache:", error);
            await fetchFromAPI();
          }
        } else {
          await fetchFromAPI();
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des communautés:", error);
        setUserCommunities([]);
      }

      // Vérifier si l'utilisateur est contributeur
      setIsContributor(membershipData.isContributor);
      setIsCreator(communityData?.creator_id === parseInt(session?.user.id));

      // Si l'utilisateur est contributeur, récupérer le nombre de posts en attente
      if (membershipData.isContributor || membershipData.isCreator) {
        try {
          await Promise.all([fetchPendingPosts(), fetchPendingEnrichments()]);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des posts en attente:",
            error
          );
        }
      }

      // Récupérer les posts de la communauté indépendamment de l'onglet actif
      try {
        await fetchCommunityPosts();
      } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error);
      }

      // Marquer le chargement comme terminé
      setIsLoadingGeneral(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setIsLoadingGeneral(false);
    }
  }, [
    communityId,
    session,
    userId,
    router,
    fetchPendingPosts,
    fetchPendingEnrichments,
    fetchCommunityPosts,
  ]);

  // Vérifier si le cache doit être invalidé après une action (comme rejoindre une communauté)
  useEffect(() => {
    // Vérifier si nous venons de rejoindre une communauté (via un paramètre d'URL ou un état local)
    const justJoined = searchParams.get("joined") === "true";

    if (justJoined && communityId) {
      // Invalider les caches pertinents
      invalidateCache(`community-${communityId}`);

      if (session?.user?.id) {
        invalidateCache(`user-communities-${session.user.id}`);
        invalidateCache(`joined-communities-${session.user.id}`);
      }

      // Recharger les données de la communauté
      loadCommunityData();

      // Nettoyer l'URL pour éviter de réinvalider le cache lors des rechargements
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("joined");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams, communityId, session, invalidateCache, loadCommunityData]);

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
      const tabFromUrl = params.get("tab");
      const votingFromUrl = params.get("voting") as
        | "creation"
        | "enrichissement"
        | null;

      if (tabFromUrl) {
        setActiveTab(tabFromUrl);
      }

      if (votingFromUrl) {
        setVotingSubTab(votingFromUrl);
      }
    };

    // Ajouter l'écouteur d'événements pour les changements d'URL
    window.addEventListener("popstate", handlePopState);

    // Nettoyer l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Effet pour surveiller les changements de searchParams et mettre à jour l'état local
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    const votingFromUrl = searchParams.get("voting") as
      | "creation"
      | "enrichissement"
      | null;

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
  }, [communityId, session, posts.length]);

  // Ajouter un effet pour précharger les données lors du changement d'onglet
  useEffect(() => {
    preloadTabData();
  }, [activeTab, preloadTabData]);

  // 2. Dans le composant
  useEffect(() => {
    if (!client || !communityId) return;

    console.log("🔄 Abonnement au canal", `community-${communityId}`);
    const channel = client.subscribe(`community-${communityId}`);

    channel.bind("post-created", async () => {
      console.log("🔄 Nouveau post détecté via Pusher");
      await fetchCommunityPosts(true);
      console.log("After fetchCommunityPosts");
    });

    return () => {
      console.log("🔄 Désabonnement du canal", `community-${communityId}`);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [communityId, client]);

  // Au début du composant, après les déclarations de state
  useEffect(() => {
    // Nettoyer le cache au chargement initial C PAS BIEN
    // console.log("🧹 Nettoyage du cache au chargement");
    // invalidateCache(`posts-${communityId}`);

    // Gérer le rafraîchissement
    const handleBeforeUnload = () => {
      console.log("🔄 Page rafraîchie, nettoyage du cache");
      invalidateCache(`posts-${communityId}`);
      invalidateCache(`community-${communityId}`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [communityId]);

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

              {/* Contenu basé sur l'onglet actif */}
              {isMember && (
                <>
                  {activeTab === "general" ? (
                    isLoadingGeneral ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader
                          size="lg"
                          color="gradient"
                          text="Chargement des données de la communauté..."
                          variant="spinner"
                        />
                      </div>
                    ) : (
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
                    )
                  ) : activeTab === "posts" ? (
                    <div id="posts-section">
                      {isLoadingPosts ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader
                            size="md"
                            color="gradient"
                            text="Chargement des posts..."
                            textPosition="right"
                          />
                        </div>
                      ) : (
                        <CommunityPosts
                          posts={Array.isArray(posts) ? posts : []}
                          communityId={communityId}
                          isContributor={isContributor}
                          userId={session?.user?.id}
                          isCreator={isCreator}
                        />
                      )}
                    </div>
                  ) : activeTab === "masterclass" ? (
                    <div id="masterclass-section">
                      {/* <MasterclassSession communityId={communityId} /> */}
                    </div>
                  ) : activeTab === "voting" ? (
                    <div id="voting-section">
                      <VotingSession
                        communityId={params.id ? params.id.toString() : ""}
                      />
                    </div>
                  ) : (
                    <div id="other-section"></div>
                  )}
                </>
              )}
            </main>
          </div>

          {/* Section Q&A avec Disclosure */}
          <div className="mt-8" id="qa-section">
            {activeTab === "general" &&
              session &&
              !isLoadingGeneral &&
              isMember && (
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

      {/* Message si l'utilisateur n'est pas membre */}
      {!isLoadingGeneral && !isMember && (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Accès limité
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez rejoindre cette communauté pour accéder à son contenu.
            </p>
            <p className="text-gray-600 mb-6">
              Consultez la présentation de la communauté et rejoignez-la pour
              découvrir tous les posts, discussions et activités.
            </p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Voir la présentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;
