"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { TopicProposal } from "../common/types";

interface ProposalsListProps {
  proposals: TopicProposal[];
  selectedProposal: TopicProposal | null;
  onSelectProposal: (proposal: TopicProposal) => void;
  onVoteProposal: (proposalId: string, type: "APPROVED" | "REJECTED") => void;
  isLoading: boolean;
}

export function ProposalsList({
  proposals,
  selectedProposal,
  onSelectProposal,
  onVoteProposal,
  isLoading,
}: ProposalsListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 flex-1">
        <p className="text-gray-500">{t("loading.default")}</p>
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 flex-1">
        <p className="text-gray-500">{t("voting.no_topic_proposals")}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-2">
        {proposals.map((proposal) => (
          <div
            key={proposal?.id || Math.random()}
            onClick={() => proposal && onSelectProposal(proposal)}
            className={`p-4 rounded-md cursor-pointer transition-colors ${
              selectedProposal?.id === proposal?.id
                ? "bg-blue-50 border border-blue-200"
                : "bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
            }`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={proposal?.createdBy?.profilePicture} />
                  <AvatarFallback>
                    {proposal?.createdBy?.name?.substring(0, 2) || "??"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">
                  {proposal.title || t("voting.untitled")}
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
                      onVoteProposal(proposal.id, "APPROVED");
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
                      onVoteProposal(proposal.id, "REJECTED");
                    }
                  }}
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
