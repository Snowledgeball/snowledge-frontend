"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Contribution, Membership } from "../common/types";
import { ContributionDetail } from "./ContributionDetail";
import { ContributionsOverview } from "./ContributionsOverview";
import { useContributions } from "../common/hooks";
import { Loader } from "@/components/ui/loader";

interface ContributionsManagerProps {
  communityId: string;
  membership: Membership | null;
  selectedContribution: Contribution | null;
  onSelectContribution: (contribution: Contribution | null) => void;
}

export function ContributionsManager({
  communityId,
  membership,
  selectedContribution,
  onSelectContribution,
}: ContributionsManagerProps) {
  const { t } = useTranslation();
  const { contributions, refreshContributions, isRefreshing } =
    useContributions(communityId, membership);

  const handleVoteContribution = useCallback(
    async (
      contributionId: number,
      postId: number | undefined,
      vote: "APPROVED" | "REJECTED",
      feedback: string
    ) => {
      if (!feedback.trim()) {
        toast.error(t("voting.feedback_required"));
        return;
      }

      try {
        // Pour un vote sur une création
        if (!postId) {
          const response = await fetch(
            `/api/communities/${communityId}/posts/${contributionId}/reviews`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: feedback,
                status: vote,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Erreur lors de la soumission de la révision");
          }

          toast.success(t("voting.vote_success"));
        }
        // Pour un vote sur un enrichissement
        else {
          const response = await fetch(
            `/api/communities/${communityId}/posts/${postId}/enrichments/${contributionId}/reviews`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: feedback,
                status: vote,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(
              "Erreur lors de la soumission de la révision d'enrichissement"
            );
          }

          toast.success(t("voting.enrichment_vote_success"));
        }

        onSelectContribution(null);
        refreshContributions();
      } catch (error) {
        console.error("Erreur:", error);
        toast.error(t("voting.vote_error"));
        throw error;
      }
    },
    [communityId, refreshContributions, t]
  );

  // Si l'utilisateur n'est pas un contributeur ou un créateur, bloquer l'accès
  if (!membership?.isContributor && !membership?.isCreator) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("voting.restricted_access")}
          </h3>
          <p className="text-gray-500 mb-4">
            {t("voting.contributor_access_required")}
          </p>
          <button
            onClick={() =>
              (window.location.href = `/profile?contributeTo=${communityId}`)
            }
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            {t("voting.apply")}
          </button>
        </div>
      </div>
    );
  }

  if (isRefreshing) {
    return (
      <div className="flex justify-center items-center py-8 flex-1">
        <Loader
          size="lg"
          color="gradient"
          text={t("loading.default")}
          variant="spinner"
        />
      </div>
    );
  }

  return (
    <>
      {selectedContribution ? (
        <ContributionDetail
          contribution={selectedContribution}
          onVoteContribution={handleVoteContribution}
        />
      ) : (
        <ContributionsOverview contributions={contributions} />
      )}
    </>
  );
}
