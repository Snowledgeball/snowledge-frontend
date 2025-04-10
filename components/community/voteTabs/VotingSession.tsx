"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, Info, Plus } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EnrichmentCompare from "../EnrichmentCompare";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Cache pour stocker les données
const contributorsCache = new Map<
  string,
  { count: number; timestamp: number }
>();

// Cache pour stocker l'onglet actif
const activeTabCache = new Map<string, { tab: string; timestamp: number }>();

// Durée de validité du cache (2 minutes)
const CACHE_DURATION = 2 * 60 * 1000;

// Type Contribution qui combine les types de création et d'enrichissement
type Contribution = {
  id: number;
  title: string;
  content: string;
  status: string;
  tag: "creation" | "enrichment";
  created_at: string;
  user: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
  community_posts_reviews?: Array<any>;
  original_content?: string;
  post_id?: number;
};

interface VotingSessionProps {
  communityId: string;
}

interface TopicProposal {
  id: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdBy: {
    name: string;
    profilePicture?: string;
  };
  createdAt: Date;
}

interface Membership {
  isContributor: boolean;
  isCreator: boolean;
  isMember: boolean;
}

export function VotingSession({ communityId }: VotingSessionProps) {
  const { data: session } = useSession();
  const [contributorsCount, setContributorsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRefreshingContributions, setIsRefreshingContributions] =
    useState(false);
  const [selectedProposal, setSelectedProposal] =
    useState<TopicProposal | null>(null);
  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
  const [willContribute, setWillContribute] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
  });
  const [proposals, setProposals] = useState<TopicProposal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [voteFeedback, setVoteFeedback] = useState("");
  const [memberships, setMemberships] = useState<Membership | null>(null);

  // Ajouter un nouvel état pour la contribution sélectionnée
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  // Mémoriser l'ID de la communauté pour éviter les re-rendus inutiles
  const memoizedCommunityId = useMemo(() => communityId, [communityId]);

  // Récupérer l'onglet actif depuis le cache ou utiliser "sujets" par défaut
  const getInitialTab = useCallback(() => {
    const cacheKey = `voting-tab-${memoizedCommunityId}`;
    const now = Date.now();

    if (activeTabCache.has(cacheKey)) {
      const cachedData = activeTabCache.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.tab;
      }
    }

    // Si pas de cache ou cache expiré, utiliser "sujets" par défaut
    return "sujets";
  }, [memoizedCommunityId]);

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Fonction optimisée pour récupérer le nombre de contributeurs
  const fetchContributorsCount = useCallback(
    async (forceRefresh = false) => {
      try {
        const cacheKey = `contributors-count-${memoizedCommunityId}`;
        const now = Date.now();

        // Vérifier si les données sont dans le cache et si elles sont encore valides
        if (!forceRefresh && contributorsCache.has(cacheKey)) {
          const cachedData = contributorsCache.get(cacheKey)!;
          if (now - cachedData.timestamp < CACHE_DURATION) {
            setContributorsCount(cachedData.count);
            return;
          }
        }

        const response = await fetch(
          `/api/communities/${memoizedCommunityId}/contributors/count`,
          {
            headers: {
              "Cache-Control": "max-age=120", // Cache de 2 minutes
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setContributorsCount(data.count);

          // Mettre en cache les données avec un timestamp
          contributorsCache.set(cacheKey, {
            count: data.count,
            timestamp: now,
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nombre de contributeurs:",
          error
        );
      }
    },
    [memoizedCommunityId]
  );

  const fetchProposals = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/communities/${memoizedCommunityId}/proposals`
      );
      const data = await response.json();
      setProposals(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des propositions:", error);
    }
  }, [memoizedCommunityId]);

  const fetchMemberships = useCallback(async () => {
    const response = await fetch(
      `/api/communities/${memoizedCommunityId}/membership`
    );
    const data = await response.json();
    console.log(data);
    setMemberships(data);
    return data;
  }, [memoizedCommunityId]);

  // Fonction pour rafraîchir les contributions
  const refreshContributions = async () => {
    setIsRefreshingContributions(true);

    if (!session || !session.user?.id) {
      console.error("Session utilisateur non disponible");
      return;
    }

    if (!memberships) {
      const membershipData = await fetchMemberships();
      if (!membershipData?.isContributor && !membershipData?.isCreator) {
        console.log("Vous n'êtes pas un contributeur de cette communauté", membershipData);
        return;
      }
    }

    try {
      // Récupérer les propositions de création
      const creationsResponse = await fetch(
        `/api/communities/${communityId}/posts/pending`
      );

      if (!creationsResponse.ok) {
        throw new Error(
          `Erreur lors de la récupération des créations : ${creationsResponse.status}`
        );
      }

      const creationsData = await creationsResponse.json();

      // Récupérer les enrichissements en attente
      const enrichmentsResponse = await fetch(
        `/api/communities/${communityId}/posts/with-pending-enrichments`
      );

      if (!enrichmentsResponse.ok) {
        throw new Error(
          `Erreur lors de la récupération des enrichissements : ${enrichmentsResponse.status}`
        );
      }

      const enrichmentsData = await enrichmentsResponse.json();

      // Formater les créations
      const formattedCreations: Contribution[] = creationsData.map(
        (creation: any) => ({
          id: creation.id,
          title: creation.title,
          content: creation.content,
          status: creation.status,
          tag: "creation",
          created_at: creation.created_at,
          user: creation.user,
          community_posts_reviews: creation.community_posts_reviews,
        })
      );

      // Formater les enrichissements
      const formattedEnrichments: Contribution[] = [];
      enrichmentsData.forEach((enrichment: any) => {
        formattedEnrichments.push({
          id: enrichment.id,
          title: enrichment.title,
          content: enrichment.content,
          status: enrichment.status,
          tag: "enrichment",
          created_at: enrichment.created_at,
          original_content: enrichment.original_content,
          post_id: enrichment.post_id,
          user: enrichment.user,
        });
      });

      // Combiner et trier par date (plus récent en premier)
      const allContributions = [
        ...formattedCreations,
        ...formattedEnrichments,
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setContributions(allContributions);
    } catch (error) {
      console.error("Erreur lors de la récupération des contributions:", error);
      toast.error(
        "Impossible de charger les contributions. Veuillez réessayer."
      );
    } finally {
      setIsRefreshingContributions(false);
    }
  };

  const loadAllData = useCallback(() => {
    if (!session) return;
    setIsLoading(true);
    fetchContributorsCount().then(() => {
      fetchProposals().then(() => {
        refreshContributions().then(() => {
          setIsLoading(false);
          setIsRefreshingContributions(false);
        });
      });
    });
  }, [session]);

  useEffect(() => {
    if (!session) return;
    loadAllData();
    console.log("aaaaaaaaaaaaaa");

    const intervalId = setInterval(() => {
      loadAllData();
    }, CACHE_DURATION);

    return () => clearInterval(intervalId);
  }, [session]);

  // Mettre à jour le cache lorsque l'onglet change
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      setSelectedProposal(null);
      setSelectedContribution(null);

      // Mettre en cache l'onglet actif
      const cacheKey = `voting-tab-${memoizedCommunityId}`;
      activeTabCache.set(cacheKey, {
        tab: value,
        timestamp: Date.now(),
      });
    },
    [memoizedCommunityId]
  );

  const handleSelectProposal = (proposal: TopicProposal) => {
    setSelectedProposal(proposal);
    setWillContribute(false);
  };

  // Fonction pour sélectionner une contribution
  const handleSelectContribution = (contribution: Contribution) => {
    setSelectedContribution(contribution);
  };

  const handleProposalVote = async (
    proposalId: string,
    type: "APPROVED" | "REJECTED"
  ) => {
    if (!session || !proposalId) return;
    console.log(willContribute);

    try {
      setIsLoading(true);
      // Appel API pour enregistrer le vote
      const response = await fetch(
        `/api/communities/${memoizedCommunityId}/proposals/${proposalId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vote: type,
            wantToContribute: willContribute,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      toast.success(
        `Vote ${type === "APPROVED" ? "positif" : "négatif"} enregistré`
      );

      fetchProposals();
      setSelectedProposal(null);
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      toast.error("Erreur lors de l'enregistrement du vote");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEnrichmentVote = async (
    contributionId: number,
    postId: number,
    vote: "APPROVED" | "REJECTED"
  ) => {
    if (!contributionId || !postId || !voteFeedback.trim()) {
      toast.error("Veuillez fournir un feedback");
      return;
    }
    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/${postId}/enrichments/${contributionId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: voteFeedback,
            status: vote,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la soumission de la révision d'enrichissement"
        );
      }

      toast.success("Vote sur l'enrichissement soumis avec succès");
      setVoteFeedback("");
      setSelectedContribution(null);

      // Rafraîchir les contributions
      refreshContributions();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la soumission du vote sur l'enrichissement");
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  const handleSubmitCreationVote = async (
    contributionId: number,
    vote: "APPROVED" | "REJECTED"
  ) => {
    if (!contributionId || !voteFeedback.trim()) {
      toast.error("Veuillez fournir un feedback");
      return;
    }
    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts/${contributionId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: voteFeedback,
            status: vote,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission de la révision");
      }

      toast.success("Vote soumis avec succès");
      setVoteFeedback("");
      setSelectedContribution(null);

      // Rafraîchir les contributions
      refreshContributions();
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la soumission du vote");
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      setIsLoading(true);
      // Appel API pour soumettre une proposition
      const response = await fetch(
        `/api/communities/${memoizedCommunityId}/proposals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newProposal,
            wantToContribute: willContribute,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la soumission");
      }

      // Récupérer la nouvelle proposition créée
      const data = await response.json();

      // Réinitialiser le formulaire
      setNewProposal({ title: "", description: "" });
      setWillContribute(false);
      setIsProposalFormOpen(false);

      toast.success("Proposition soumise avec succès !");
    } catch (error) {
      console.error("Erreur lors de la soumission de la proposition:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la soumission de la proposition"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [isContributorDialogOpen, setIsContributorDialogOpen] = useState(false);


  return (
    <div
      className="bg-white rounded-lg shadow-sm h-full flex flex-col"
      id="voting-sessions"
    >
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Sessions de vote
          </h2>
          <div className="flex items-center text-sm text-gray-600">
            <Info className="w-4 h-4 mr-1 text-blue-500" />
            <span>Nombre de contributeurs: {contributorsCount}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8 flex-1">
          <Loader
            size="md"
            color="gradient"
            text="Chargement..."
            variant="spinner"
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar avec les onglets */}
          <div className="w-[20rem] border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${activeTab === "sujets"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => handleTabChange("sujets")}
                >
                  Sujets
                </button>
                {memberships?.isContributor || memberships?.isCreator ? (
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${activeTab === "contributions"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                    onClick={() => handleTabChange("contributions")}
                  >
                    Contributions
                  </button>
                ) : (
                  <AlertDialog open={isContributorDialogOpen} onOpenChange={setIsContributorDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-md flex-1 opacity-50 
                          cursor-not-allowed text-gray-500 bg-gray-100`}
                      >
                        Contributions
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Accès restreint</AlertDialogTitle>
                        <AlertDialogDescription>
                          Vous devez être contributeur ou créateur de cette communauté pour accéder à cette section. Souhaitez-vous postuler en tant que contributeur ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Fermer</AlertDialogCancel>
                        <AlertDialogAction onClick={() => window.location.href = `/profile`}>
                          Postuler
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            {isRefreshingContributions ? (
              <div className="flex justify-center items-center py-8 flex-1">
                <Loader
                  size="lg"
                  color="gradient"
                  text="Chargement..."
                  variant="spinner"
                />
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {activeTab === "sujets" &&
                    proposals &&
                    proposals.length > 0 ? (
                    proposals.map((proposal) => (
                      <div
                        key={proposal?.id || Math.random()}
                        onClick={() =>
                          proposal && handleSelectProposal(proposal)
                        }
                        className={`p-4 rounded-md cursor-pointer transition-colors ${selectedProposal?.id === proposal?.id
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                          }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={proposal?.createdBy?.profilePicture}
                              />
                              <AvatarFallback>
                                {proposal?.createdBy?.name?.substring(0, 2) ||
                                  "??"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">
                              {proposal.title || "Sans titre"}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {proposal.description}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 hover:bg-green-200 text-green-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (proposal?.id) {
                                  handleProposalVote(proposal.id, "APPROVED");
                                }
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (proposal?.id) {
                                  handleProposalVote(proposal.id, "REJECTED");
                                }
                              }}
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : activeTab === "sujets" &&
                    (!proposals || proposals.length === 0) ? (
                    <div className="flex justify-center items-center py-8 flex-1">
                      <p className="text-gray-500">
                        Aucune proposition de sujet disponible.
                      </p>
                    </div>
                  ) : contributions && contributions.length > 0 ? (
                    contributions.map((contribution) => (
                      <div
                        key={contribution?.id || Math.random()}
                        onClick={() =>
                          contribution && handleSelectContribution(contribution)
                        }
                        className={`rounded-md cursor-pointer overflow-hidden mb-2 border ${selectedContribution?.id === contribution?.id
                          ? contribution?.tag === "creation"
                            ? "bg-purple-100 border-purple-300"
                            : "bg-blue-100 border-blue-300"
                          : contribution?.tag === "creation"
                            ? "border-l-4 border-l-purple-500 border-gray-200 bg-white"
                            : "border-l-4 border-l-blue-500 border-gray-200 bg-white"
                          } hover:shadow-sm transition-all`}
                      >
                        {/* Section du contenu principal */}
                        <div className="p-3">
                          {/* Badge d'étiquette */}
                          <div className="flex justify-between items-center mb-1.5">
                            <span
                              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${contribution.tag === "creation"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {contribution.tag === "creation"
                                ? "Création"
                                : "Enrichissement"}
                            </span>
                          </div>

                          {/* Titre avec troncature */}
                          <h3 className="font-medium text-gray-800 text-sm sm:text-base mb-1">
                            {(() => {
                              const tempDiv = document.createElement("div");
                              const safeTitle = contribution.title || "";
                              tempDiv.innerHTML = safeTitle.replace(
                                /<\/?[^>]+(>|$)/g,
                                ""
                              );
                              const text =
                                tempDiv.textContent || tempDiv.innerText || "";
                              // Limiter à 28 caractères pour le titre
                              return text.length > 28
                                ? text.substring(0, 28) + "..."
                                : text;
                            })()}
                          </h3>

                          {/* Contenu avec troncature */}
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {(() => {
                              const tempDiv = document.createElement("div");
                              const safeContent = contribution.content || "";
                              tempDiv.innerHTML = safeContent.replace(
                                /<\/?[^>]+(>|$)/g,
                                ""
                              );
                              const text =
                                tempDiv.textContent || tempDiv.innerText || "";
                              // Limiter à 50 caractères pour le contenu
                              return text.length > 40
                                ? text.substring(0, 40) + "..."
                                : text;
                            })()}
                          </p>
                        </div>

                        {/* Section de pied pour l'auteur */}
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5 flex-shrink-0">
                              <AvatarImage
                                src={contribution.user.profilePicture}
                              />
                              <AvatarFallback>
                                {(() => {
                                  const name =
                                    contribution?.user?.fullName || "";
                                  // Limiter à 15 caractères pour le nom d'utilisateur
                                  return name.length > 15
                                    ? name.substring(0, 15) + "..."
                                    : name;
                                })()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">
                              {(() => {
                                const name = contribution?.user?.fullName || "";
                                // Limiter à 15 caractères pour le nom d'utilisateur
                                return name.length > 15
                                  ? name.substring(0, 15) + "..."
                                  : name;
                              })()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {format(
                              new Date(contribution?.created_at || new Date()),
                              "dd/MM/yy",
                              { locale: fr }
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center py-8 flex-1">
                      <p className="text-gray-500">
                        Aucune contribution disponible.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedProposal && activeTab === "sujets" ? (
              // Affichage du détail d'une proposition sélectionnée
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedProposal.title || ""}
                    </h2>
                    <Sheet
                      open={isProposalFormOpen}
                      onOpenChange={setIsProposalFormOpen}
                    >
                      <SheetTrigger asChild>
                        <Button className="border border-dashed border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
                          Proposer un sujet
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="sm:max-w-[500px] bg-white"
                      >
                        <SheetHeader>
                          <SheetTitle>Proposer un nouveau sujet</SheetTitle>
                          <SheetDescription>
                            Remplissez le formulaire ci-dessous pour proposer un
                            nouveau sujet à la communauté.
                          </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmitProposal}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="title" className="text-right">
                                Titre
                              </Label>
                              <Input
                                id="title"
                                value={newProposal.title}
                                onChange={(e) =>
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="description"
                                className="text-right self-start"
                              >
                                Description
                              </Label>
                              <Textarea
                                id="description"
                                value={newProposal.description}
                                onChange={(e) =>
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                className="col-span-3 min-h-[200px]"
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="contribute-new"
                                checked={willContribute}
                                onCheckedChange={setWillContribute}
                              />
                              <Label
                                htmlFor="contribute-new"
                                className="text-sm text-gray-700"
                              >
                                Je souhaite contribuer à cette proposition
                              </Label>
                            </div>
                          </div>
                          <SheetFooter className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between w-full">
                            <div className="flex space-x-2 sm:justify-end">
                              <SheetClose asChild>
                                <Button type="button" variant="outline">
                                  Annuler
                                </Button>
                              </SheetClose>
                              <Button type="submit">
                                Soumettre la proposition
                              </Button>
                            </div>
                          </SheetFooter>
                        </form>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>

                <div className="p-4 overflow-auto flex-1">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre
                      </label>
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-800">
                          {selectedProposal.title || ""}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-800">
                          {selectedProposal.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <div className="flex space-x-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() =>
                        handleProposalVote(selectedProposal.id, "APPROVED")
                      }
                    >
                      Valider le sujet
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() =>
                        handleProposalVote(selectedProposal.id, "REJECTED")
                      }
                    >
                      Refuser
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox
                      id="contribute"
                      checked={willContribute}
                      onCheckedChange={(checked) =>
                        setWillContribute(!!checked)
                      }
                    />
                    <label
                      htmlFor="contribute"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Se proposer pour rédiger ce sujet
                    </label>
                  </div>
                </div>
              </div>
            ) : selectedContribution && activeTab === "contributions" ? (
              // Affichage du détail d'une contribution sélectionnée
              <div className="flex flex-col h-full">
                {/* En-tête avec le titre et informations */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-gray-800 truncate">
                        {selectedContribution?.title?.length > 32
                          ? selectedContribution?.title?.substring(0, 32) +
                          "..."
                          : selectedContribution?.title || ""}
                      </h2>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedContribution.tag === "creation"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {selectedContribution.tag === "creation"
                          ? "Création"
                          : "Enrichissement"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedContribution.user.profilePicture}
                        />
                        <AvatarFallback>
                          {(() => {
                            const name =
                              selectedContribution?.user?.fullName || "";
                            // Limiter à 15 caractères pour le nom d'utilisateur
                            return name.length > 15
                              ? name.substring(0, 15) + "..."
                              : name;
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-800 truncate">
                          {(() => {
                            const name =
                              selectedContribution?.user?.fullName || "";
                            // Limiter à 15 caractères pour le nom d'utilisateur
                            return name.length > 15
                              ? name.substring(0, 15) + "..."
                              : name;
                          })()}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Proposé le{" "}
                          {format(
                            new Date(
                              selectedContribution?.created_at || new Date()
                            ),
                            "d MMMM yyyy",
                            { locale: fr }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zone de contenu scrollable */}
                <div className="flex-1 overflow-hidden">
                  {selectedContribution.tag === "creation" ? (
                    <div className="h-full flex flex-col">
                      <div className="sticky top-0 z-10 bg-gray-50 py-2 border-b border-gray-200 flex-shrink-0">
                        <div className="px-4 py-1.5 flex items-center space-x-2 justify-start">
                          <span className="text-sm text-gray-500">
                            Contenu :
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <div
                          className="contribution-content tinymce-content p-4"
                          dangerouslySetInnerHTML={{
                            __html: selectedContribution?.content || "",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto">
                        <EnrichmentCompare
                          originalContent={
                            selectedContribution?.original_content || ""
                          }
                          modifiedContent={selectedContribution?.content || ""}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pied de page fixe avec la zone de feedback et les boutons */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Justification de votre vote
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder="Expliquez en quelques mots votre décision..."
                    className="w-full h-[2.5rem] text-sm mb-4"
                    value={voteFeedback}
                    onChange={(e) => setVoteFeedback(e.target.value)}
                  />

                  <div className="flex space-x-3">
                    <Button
                      className={`flex-1 ${selectedContribution.tag === "creation"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-blue-600 hover:bg-blue-700"
                        } text-white ${isApproving ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      onClick={() => {
                        if (!selectedContribution) return;
                        setIsApproving(true);
                        if (selectedContribution.tag === "creation") {
                          handleSubmitCreationVote(
                            selectedContribution.id,
                            "APPROVED"
                          );
                        } else {
                          handleSubmitEnrichmentVote(
                            selectedContribution.id,
                            selectedContribution.post_id || 0,
                            "APPROVED"
                          );
                        }
                      }}
                    >
                      {isApproving ? (
                        <span className="flex items-center gap-2">
                          <Loader size="sm" color="white" />
                          Chargement...
                        </span>
                      ) : (
                        "Approuver"
                      )}
                    </Button>
                    <Button
                      className={`flex-1 bg-red-600 hover:bg-red-700 text-white ${isRejecting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      onClick={() => {
                        if (!selectedContribution) return;
                        setIsRejecting(true);
                        if (selectedContribution.tag === "creation") {
                          handleSubmitCreationVote(
                            selectedContribution.id,
                            "REJECTED"
                          );
                        } else {
                          handleSubmitEnrichmentVote(
                            selectedContribution.id,
                            selectedContribution.post_id || 0,
                            "REJECTED"
                          );
                        }
                      }}
                    >
                      {isRejecting ? (
                        <span className="flex items-center gap-2">
                          <Loader size="sm" color="white" />
                          Chargement...
                        </span>
                      ) : (
                        "Rejeter"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : activeTab === "contributions" && !selectedContribution ? (
              // Affichage d'informations sur les contributions quand aucune n'est sélectionnée
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Contributions à la communauté
                  </h2>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium">
                      Création de contenu
                    </span>
                    <div className="w-3 h-3 rounded-full bg-blue-500 ml-4"></div>
                    <span className="text-sm font-medium">Enrichissement</span>
                    <div className="w-3 h-3 rounded-full bg-amber-500 ml-4"></div>
                    <span className="text-sm font-medium">
                      En attente de révision
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Les contributions représentent le contenu créé ou enrichi
                    par les membres de la communauté. Sélectionnez une
                    contribution dans la liste à gauche pour voir les détails et
                    voter.
                  </p>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques des contributions</CardTitle>
                    <CardDescription>
                      Aperçu des contributions de la communauté
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-purple-600">
                          {
                            contributions.filter((c) => c.tag === "creation")
                              .length
                          }
                        </span>
                        <p className="text-sm text-gray-500">Créations</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {
                            contributions.filter((c) => c.tag === "enrichment")
                              .length
                          }
                        </span>
                        <p className="text-sm text-gray-500">Enrichissements</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-amber-600">
                          {contributions.length}
                        </span>
                        <p className="text-sm text-gray-500">En attente</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Message par défaut quand rien n'est sélectionné
              <>
                <div className="flex justify-end m-4">
                  {activeTab === "sujets" && (
                    <Sheet
                      open={isProposalFormOpen}
                      onOpenChange={setIsProposalFormOpen}
                    >
                      <SheetTrigger asChild>
                        <Button className="border border-dashed border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
                          Proposer un sujet
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="right"
                        className="sm:max-w-[500px] bg-white"
                      >
                        <SheetHeader>
                          <SheetTitle>Proposer un nouveau sujet</SheetTitle>
                          <SheetDescription>
                            Remplissez le formulaire ci-dessous pour proposer un
                            nouveau sujet à la communauté.
                          </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmitProposal}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="title" className="text-right">
                                Titre
                              </Label>
                              <Input
                                id="title"
                                value={newProposal.title}
                                onChange={(e) =>
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label
                                htmlFor="description"
                                className="text-right self-start"
                              >
                                Description
                              </Label>
                              <Textarea
                                id="description"
                                value={newProposal.description}
                                onChange={(e) =>
                                  setNewProposal((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                className="col-span-3 min-h-[200px]"
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="contribute-new"
                                checked={willContribute}
                                onCheckedChange={setWillContribute}
                              />
                              <Label
                                htmlFor="contribute-new"
                                className="text-sm text-gray-700"
                              >
                                Je souhaite contribuer à cette proposition
                              </Label>
                            </div>
                          </div>
                          <SheetFooter className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between w-full">
                            <div className="flex space-x-2 sm:justify-end">
                              <SheetClose asChild>
                                <Button type="button" variant="outline">
                                  Annuler
                                </Button>
                              </SheetClose>
                              <Button type="submit">
                                Soumettre la proposition
                              </Button>
                            </div>
                          </SheetFooter>
                        </form>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    {activeTab === "sujets"
                      ? "Sélectionnez un sujet pour voir les détails"
                      : "Sélectionnez une contribution pour voir les détails"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
