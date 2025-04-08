"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import EnrichmentVotingSession from "./EnrichmentVotingSession";
import CreationVotingSession from "./CreationVotingSession";
import { Loader } from "@/components/ui/loader";
import ProposalsVotingSession from "./ProposalsVotingSession";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  cover_image_url: string | null;
  user: {
    id: number;
    fullName: string;
    profilePicture: string;
  };
  community_posts_reviews?: Array<any>;
  community_posts_enrichments?: Array<any>;
  original_content?: string;
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

export function VotingSession({ communityId }: VotingSessionProps) {
  const { data: session } = useSession();
  const [contributorsCount, setContributorsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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
  const [currentPage, setCurrentPage] = useState(1);

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
      console.log("proposals", data);
    } catch (error) {
      console.error("Erreur lors de la récupération des propositions:", error);
    }
  }, [memoizedCommunityId]);

  // Hook pour récupérer et formater toutes les contributions
  useEffect(() => {
    const fetchAllContributions = async () => {
      try {
        // Récupérer les propositions de création
        const creationsResponse = await fetch(
          `/api/communities/${communityId}/posts/pending`
        );
        const creationsData = await creationsResponse.json();

        // Récupérer les enrichissements en attente
        const enrichmentsResponse = await fetch(
          `/api/communities/${communityId}/posts/with-pending-enrichments`
        );
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
            cover_image_url: creation.cover_image_url,
            user: creation.user,
            community_posts_reviews: creation.community_posts_reviews,
          })
        );

        // Formater les enrichissements
        const formattedEnrichments: Contribution[] = [];
        enrichmentsData.forEach((post: any) => {
          post.community_posts_enrichments?.forEach((enrichment: any) => {
            formattedEnrichments.push({
              id: enrichment.id,
              title: enrichment.title || `Enrichissement de ${post.title}`,
              content: enrichment.content,
              status: enrichment.status,
              tag: "enrichment",
              created_at: enrichment.created_at,
              cover_image_url: post.cover_image_url,
              user: enrichment.user,
              original_content: enrichment.original_content,
            });
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
        console.error(
          "Erreur lors de la récupération des contributions:",
          error
        );
      }
    };

    fetchAllContributions();
  }, [communityId]);

  // Fonction pour charger toutes les données nécessaires
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchContributorsCount(), fetchProposals()]);
    setIsLoading(false);
  }, [fetchContributorsCount, fetchProposals]);

  // Effet pour charger les données initiales
  useEffect(() => {
    loadAllData();

    // Mettre en place un intervalle pour rafraîchir les données toutes les 2 minutes
    const intervalId = setInterval(() => {
      loadAllData();
    }, CACHE_DURATION);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [loadAllData]);

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
  };

  // Fonction pour sélectionner une contribution
  const handleSelectContribution = (contribution: Contribution) => {
    setSelectedContribution(contribution);
  };

  const handleVote = async (proposalId: string, type: "approve" | "reject") => {
    if (!session) return;

    try {
      // Appel API pour enregistrer le vote
      const response = await fetch(
        `/api/communities/${memoizedCommunityId}/proposals/${proposalId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vote: type }),
        }
      );

      if (!response.ok) {
        // Si l'API n'existe pas encore, simuler le vote
        setProposals((prev) =>
          prev.map((proposal) => {
            if (proposal.id === proposalId) {
              toast.success(
                `Vote ${type === "approve" ? "positif" : "négatif"} enregistré`
              );
            }
            return proposal;
          })
        );
      } else {
        const data = await response.json();
        toast.success(
          `Vote ${type === "approve" ? "positif" : "négatif"} enregistré`
        );
        // Rafraîchir les propositions
        fetchProposals();
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      toast.error("Erreur lors de l'enregistrement du vote");
    }
  };

  // Fonction pour gérer le vote sur une contribution
  const handleContributionVote = async (
    contributionId: number,
    type: "approve" | "reject"
  ) => {
    if (!session) return;

    try {
      // Appel API pour approuver ou rejeter un enrichissement
      const endpoint = type === "approve" ? "approve" : "reject";
      const response = await fetch(
        `/api/communities/${memoizedCommunityId}/posts/${selectedContribution?.id}/enrichments/${contributionId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // Si l'API n'existe pas encore, simuler l'action
        setContributions((prev) =>
          prev.map((contribution) => {
            if (contribution.id === contributionId) {
              toast.success(
                `Vote ${
                  type === "approve" ? "positif" : "négatif"
                } enregistré sur la contribution`
              );
            }
            return contribution;
          })
        );
      } else {
        const data = await response.json();
        toast.success(
          `Contribution ${type === "approve" ? "approuvée" : "rejetée"}`
        );
        // Rafraîchir les contributions
        setSelectedContribution(null);
      }
    } catch (error) {
      console.error("Erreur lors du vote sur la contribution:", error);
      toast.error("Erreur lors de l'enregistrement du vote");
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      // Appel API pour soumettre une proposition
      const response = await fetch(
        `/api/communities/${memoizedCommunityId}/proposals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProposal),
        }
      );

      if (!response.ok) {
        // Si l'API n'existe pas encore, simuler la soumission
        const newProposalData: TopicProposal = {
          id: Math.random().toString(),
          title: newProposal.title,
          description: newProposal.description,
          status: "pending",
          createdBy: {
            name: session.user?.name || "Utilisateur actuel",
            profilePicture: session.user?.image || "/images/default-avatar.png",
          },
          createdAt: new Date(),
        };

        setProposals((prev) => [...prev, newProposalData]);
      } else {
        const data = await response.json();
        // Rafraîchir les propositions
        fetchProposals();
      }

      setNewProposal({ title: "", description: "" });
      setIsProposalFormOpen(false);
      toast.success("Proposition soumise avec succès !");
    } catch (error) {
      console.error("Erreur lors de la soumission de la proposition:", error);
      toast.error("Erreur lors de la soumission de la proposition");
    }
  };

  const handlePageChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (direction === "next" && currentPage < 3) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm" id="voting-sessions">
      <div className="border-b border-gray-200 p-4">
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
        <div className="flex justify-center items-center py-8">
          <Loader
            size="md"
            color="gradient"
            text="Chargement..."
            variant="spinner"
          />
        </div>
      ) : (
        <>
          {/* <CreationVotingSession communityId={communityId} />
          <EnrichmentVotingSession communityId={communityId} /> */}
          <div className="flex">
            {/* Sidebar avec les onglets */}
            <div className="w-[350px] border-r border-gray-200 min-h-[600px]">
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${
                      activeTab === "sujets"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleTabChange("sujets")}
                  >
                    Sujets
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${
                      activeTab === "contributions"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleTabChange("contributions")}
                  >
                    Contributions
                  </button>
                </div>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="p-2 space-y-2">
                  {activeTab === "sujets"
                    ? // Affichage des propositions de sujets
                      proposals.map((proposal) => (
                        <div
                          key={proposal.id}
                          onClick={() => handleSelectProposal(proposal)}
                          className={`p-4 rounded-md cursor-pointer transition-colors ${
                            selectedProposal?.id === proposal.id
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={proposal.createdBy.profilePicture}
                                />
                                <AvatarFallback>
                                  {proposal.createdBy.name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">
                                {proposal.title}
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
                                  handleVote(proposal.id, "approve");
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(proposal.id, "reject");
                                }}
                              >
                                <Plus className="w-4 h-4 rotate-45" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    : // Affichage des contributions (créations et enrichissements)
                      contributions.map((contribution) => (
                        <div
                          key={contribution.id}
                          onClick={() => handleSelectContribution(contribution)}
                          className={`p-4 rounded-md cursor-pointer transition-colors ${
                            selectedContribution?.id === contribution.id
                              ? contribution.tag === "creation"
                                ? "bg-purple-100 border border-purple-300"
                                : "bg-blue-100 border border-blue-300"
                              : contribution.tag === "creation"
                              ? "border-l-4 border-l-purple-500 bg-purple-50/30 hover:bg-purple-50"
                              : "border-l-4 border-l-blue-500 bg-blue-50/30 hover:bg-blue-50"
                          } border border-gray-200`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={contribution.user.profilePicture}
                                />
                                <AvatarFallback>
                                  {contribution.user.fullName.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-800 truncate">
                                  {(() => {
                                    // Créer un élément div temporaire pour gérer le décodage des entités HTML
                                    const tempDiv =
                                      document.createElement("div");
                                    // Insérer le titre sans les balises HTML
                                    tempDiv.innerHTML =
                                      contribution.title.replace(
                                        /<\/?[^>]+(>|$)/g,
                                        ""
                                      );
                                    // Récupérer le texte décodé
                                    const cleanTitle =
                                      tempDiv.textContent ||
                                      tempDiv.innerText ||
                                      "";

                                    return cleanTitle.length > 15
                                      ? cleanTitle.substring(0, 15) + "..."
                                      : cleanTitle;
                                  })()}
                                </h3>
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                    contribution.tag === "creation"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {contribution.tag === "creation"
                                    ? "Création"
                                    : "Enrichissement"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 contribution-preview">
                                {(() => {
                                  // Créer un élément div temporaire pour gérer le décodage des entités HTML
                                  const tempDiv = document.createElement("div");
                                  // Insérer le contenu sans les balises HTML
                                  tempDiv.innerHTML =
                                    contribution.content.replace(
                                      /<\/?[^>]+(>|$)/g,
                                      ""
                                    );
                                  // Récupérer le texte décodé
                                  const cleanContent =
                                    tempDiv.textContent ||
                                    tempDiv.innerText ||
                                    "";

                                  return cleanContent.length > 32
                                    ? cleanContent.substring(0, 32) + "..."
                                    : cleanContent;
                                })()}
                              </div>
                              <div className="mt-2 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                  Proposé par {contribution.user.fullName} •{" "}
                                  {new Date(
                                    contribution.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </ScrollArea>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 p-6">
              {selectedProposal && activeTab === "sujets" ? (
                // Affichage du détail d'une proposition sélectionnée
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedProposal.title}
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
                          </div>
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button type="button" variant="outline">
                                Annuler
                              </Button>
                            </SheetClose>
                            <Button type="submit">
                              Soumettre la proposition
                            </Button>
                          </SheetFooter>
                        </form>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre
                      </label>
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-gray-800">
                          {selectedProposal.title}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 min-h-[200px]">
                        <p className="text-gray-800">
                          {selectedProposal.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          handleVote(selectedProposal.id, "approve")
                        }
                      >
                        Valider le sujet
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() =>
                          handleVote(selectedProposal.id, "reject")
                        }
                      >
                        Refuser
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 py-2">
                      <div className="flex items-center space-x-2">
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
                </div>
              ) : selectedContribution && activeTab === "contributions" ? (
                // Affichage du détail d'une contribution sélectionnée
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {selectedContribution.title}
                      </h2>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          selectedContribution.tag === "creation"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedContribution.tag === "creation"
                          ? "Création"
                          : "Enrichissement"}
                      </span>
                    </div>
                    <span className="text-sm font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                      En attente de validation
                    </span>
                  </div>

                  <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedContribution.user.profilePicture}
                      />
                      <AvatarFallback>
                        {selectedContribution.user.fullName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">
                        {selectedContribution.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Proposé le{" "}
                        {new Date(
                          selectedContribution.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contenu
                      </label>
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 min-h-[200px] max-h-[400px] overflow-auto">
                        <div
                          className="contribution-content"
                          dangerouslySetInnerHTML={{
                            __html: selectedContribution.content,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        className={`flex-1 ${
                          selectedContribution.tag === "creation"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                        onClick={() =>
                          handleContributionVote(
                            selectedContribution.id,
                            "approve"
                          )
                        }
                      >
                        Approuver
                      </Button>
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        onClick={() =>
                          handleContributionVote(
                            selectedContribution.id,
                            "reject"
                          )
                        }
                      >
                        Rejeter
                      </Button>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-6">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800">
                            À propos de cette validation
                          </h4>
                          <p className="text-sm text-amber-700 mt-1">
                            {selectedContribution.tag === "creation"
                              ? "En validant cette création, vous confirmez que le contenu respecte les règles de la communauté et apporte une valeur ajoutée."
                              : "En validant cet enrichissement, vous confirmez que les modifications proposées améliorent le contenu existant."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === "contributions" && !selectedContribution ? (
                // Affichage d'informations sur les contributions quand aucune n'est sélectionnée
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
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
                      <span className="text-sm font-medium">
                        Enrichissement
                      </span>
                      <div className="w-3 h-3 rounded-full bg-amber-500 ml-4"></div>
                      <span className="text-sm font-medium">
                        En attente de validation
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Les contributions représentent le contenu créé ou enrichi
                      par les membres de la communauté. Sélectionnez une
                      contribution dans la liste à gauche pour voir les détails
                      et voter.
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
                              contributions.filter(
                                (c) => c.tag === "enrichment"
                              ).length
                            }
                          </span>
                          <p className="text-sm text-gray-500">
                            Enrichissements
                          </p>
                        </div>
                        <div className="text-center">
                          <span className="text-2xl font-bold text-amber-600">
                            {
                              contributions.filter(
                                (c) => c.status === "PENDING"
                              ).length
                            }
                          </span>
                          <p className="text-sm text-gray-500">En attente</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Message par défaut quand rien n'est sélectionné
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    {activeTab === "sujets"
                      ? "Sélectionnez un sujet pour voir les détails"
                      : "Sélectionnez une contribution pour voir les détails"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
