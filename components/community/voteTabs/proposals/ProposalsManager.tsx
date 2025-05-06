"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { TopicProposal, Membership } from "../common/types";
import { ProposalDetail } from "./ProposalDetail";
import { ProposalForm } from "./ProposalForm";
import { ProposalsOverview } from "./ProposalsOverview";
import { useProposals } from "../common/hooks";

interface ProposalsManagerProps {
  communityId: string;
  membership: Membership | null;
  selectedProposal: TopicProposal | null;
  onSelectProposal: (proposal: TopicProposal | null) => void;
}

export function ProposalsManager({
  communityId,
  membership,
  selectedProposal,
  onSelectProposal,
}: ProposalsManagerProps) {
  const { t } = useTranslation();
  const { proposals, fetchProposals, isLoading } = useProposals(communityId);
  const [willContribute, setWillContribute] = useState(false);
  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);

  const handleProposalVote = useCallback(
    async (proposalId: string, type: "APPROVED" | "REJECTED") => {
      try {
        // Appel API pour enregistrer le vote
        const response = await fetch(
          `/api/communities/${communityId}/proposals/${proposalId}/vote`,
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

        toast.success(
          t("voting.vote_registered", {
            type:
              type === "APPROVED" ? t("voting.positive") : t("voting.negative"),
          })
        );

        fetchProposals();
        onSelectProposal(null);
      } catch (error) {
        console.error("Erreur lors du vote:", error);
        toast.error(t("voting.vote_error"));
      }
    },
    [communityId, fetchProposals, t, willContribute, onSelectProposal]
  );

  const handleSubmitProposal = useCallback(
    async (title: string, description: string, willContribute: boolean) => {
      try {
        // Appel API pour soumettre une proposition
        const response = await fetch(
          `/api/communities/${communityId}/proposals`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              description,
              wantToContribute: willContribute,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la soumission");
        }

        toast.success(t("voting.proposal_submitted"));

        // Rafraîchir la liste des propositions
        fetchProposals();
      } catch (error) {
        console.error("Erreur lors de la soumission de la proposition:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : t("voting.proposal_submission_error")
        );
        throw error; // Re-throw pour que le composant de formulaire puisse le gérer
      }
    },
    [communityId, fetchProposals, t]
  );

  return (
    <>
      {selectedProposal ? (
        <ProposalDetail
          proposal={selectedProposal}
          willContribute={willContribute}
          onWillContributeChange={setWillContribute}
          onVoteProposal={handleProposalVote}
          membership={membership}
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-end m-4">
            {(membership?.isContributor || membership?.isCreator) && (
              <ProposalForm
                onSubmit={handleSubmitProposal}
                isOpen={isProposalFormOpen}
                onOpenChange={setIsProposalFormOpen}
              />
            )}
          </div>
          <ProposalsOverview proposals={proposals} />
        </div>
      )}
    </>
  );
}
