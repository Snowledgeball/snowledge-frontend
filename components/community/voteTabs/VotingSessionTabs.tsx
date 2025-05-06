"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";
import { Loader } from "@/components/ui/loader";
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
import { ProposalsList } from "./proposals/ProposalsList";
import { ProposalsManager } from "./proposals/ProposalsManager";
import { ContributionsList } from "./contributions/ContributionsList";
import { ContributionsManager } from "./contributions/ContributionsManager";
import {
  useContributorsCount,
  useMembership,
  useProposals,
  useContributions,
} from "./common/hooks";
import {
  TopicProposal,
  Contribution,
  activeTabCache,
  CACHE_DURATION,
} from "./common/types";

interface VotingSessionTabsProps {
  communityId: string;
}

export function VotingSessionTabs({ communityId }: VotingSessionTabsProps) {
  const { t } = useTranslation();

  // Récupérer l'onglet actif depuis le cache ou utiliser "sujets" par défaut
  const getInitialTab = () => {
    const cacheKey = `voting-tab-${communityId}`;
    const now = Date.now();

    if (activeTabCache.has(cacheKey)) {
      const cachedData = activeTabCache.get(cacheKey)!;
      if (now - cachedData.timestamp < CACHE_DURATION) {
        return cachedData.tab;
      }
    }

    // Si pas de cache ou cache expiré, utiliser "sujets" par défaut
    return "sujets";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isContributorDialogOpen, setIsContributorDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] =
    useState<TopicProposal | null>(null);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  // Utiliser les hooks pour récupérer les données
  const { contributorsCount, isLoading: isLoadingContributors } =
    useContributorsCount(communityId);
  const { membership, isLoading: isLoadingMembership } =
    useMembership(communityId);
  const { proposals, isLoading: isLoadingProposals } =
    useProposals(communityId);
  const { contributions, isRefreshing: isRefreshingContributions } =
    useContributions(communityId, membership);

  // Mettre à jour le cache lorsque l'onglet change
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      setSelectedProposal(null);
      setSelectedContribution(null);

      // Mettre en cache l'onglet actif
      const cacheKey = `voting-tab-${communityId}`;
      activeTabCache.set(cacheKey, {
        tab: value,
        timestamp: Date.now(),
      });
    },
    [communityId]
  );

  const handleSelectProposal = useCallback((proposal: TopicProposal | null) => {
    setSelectedProposal(proposal);
  }, []);

  const handleSelectContribution = useCallback(
    (contribution: Contribution | null) => {
      setSelectedContribution(contribution);
    },
    []
  );

  const isLoading =
    isLoadingContributors || isLoadingMembership || isLoadingProposals;

  return (
    <div
      className="bg-white rounded-lg shadow-sm h-full flex flex-col"
      id="voting-sessions"
    >
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {t("voting.sessions")}
          </h2>
          <div className="flex items-center text-sm text-gray-600">
            <Info className="w-4 h-4 mr-1 text-blue-500" />
            <span>
              {t("voting.contributors_count", { count: contributorsCount })}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8 flex-1">
          <Loader
            size="md"
            color="gradient"
            text={t("loading.default")}
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
                  className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${
                    activeTab === "sujets"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleTabChange("sujets")}
                >
                  {t("voting.topics")}
                </button>
                {membership?.isContributor || membership?.isCreator ? (
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md flex-1 ${
                      activeTab === "contributions"
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleTabChange("contributions")}
                  >
                    {t("voting.contributions")}
                  </button>
                ) : (
                  <AlertDialog
                    open={isContributorDialogOpen}
                    onOpenChange={setIsContributorDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <button
                        className={`px-4 py-2 text-sm font-medium rounded-md flex-1 opacity-50 
                          cursor-not-allowed text-gray-500 bg-gray-100`}
                      >
                        {t("voting.contributions")}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("voting.restricted_access")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("voting.contributor_access_required")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("actions.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            (window.location.href = `/profile?contributeTo=${communityId}`)
                          }
                        >
                          {t("voting.apply")}
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
                  text={t("loading.default")}
                  variant="spinner"
                />
              </div>
            ) : activeTab === "sujets" ? (
              <ProposalsList
                proposals={proposals}
                selectedProposal={selectedProposal}
                onSelectProposal={handleSelectProposal}
                onVoteProposal={() => {}}
                isLoading={isLoadingProposals}
              />
            ) : (
              <ContributionsList
                contributions={contributions}
                selectedContribution={selectedContribution}
                onSelectContribution={handleSelectContribution}
                isLoading={isRefreshingContributions}
              />
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "sujets" ? (
              <ProposalsManager
                communityId={communityId}
                membership={membership}
                selectedProposal={selectedProposal}
                onSelectProposal={handleSelectProposal}
              />
            ) : (
              <ContributionsManager
                communityId={communityId}
                membership={membership}
                selectedContribution={selectedContribution}
                onSelectContribution={handleSelectContribution}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
