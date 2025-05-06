"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TopicProposal, Membership } from "../common/types";

interface ProposalDetailProps {
  proposal: TopicProposal;
  willContribute: boolean;
  onWillContributeChange: (value: boolean) => void;
  onVoteProposal: (proposalId: string, type: "APPROVED" | "REJECTED") => void;
  membership: Membership | null;
}

export function ProposalDetail({
  proposal,
  willContribute,
  onWillContributeChange,
  onVoteProposal,
  membership,
}: ProposalDetailProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {proposal.title || ""}
          </h2>
        </div>
      </div>

      <div className="p-4 overflow-auto flex-1">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("voting.title")}
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-800">{proposal.title || ""}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("voting.description")}
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-800">{proposal.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex space-x-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onVoteProposal(proposal.id, "APPROVED")}
          >
            {t("voting.approve_topic")}
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onVoteProposal(proposal.id, "REJECTED")}
          >
            {t("voting.reject")}
          </Button>
        </div>
        {(membership?.isContributor || membership?.isCreator) && (
          <div className="flex items-center space-x-2 mt-3">
            <Checkbox
              id="contribute"
              checked={willContribute}
              onCheckedChange={(checked) => onWillContributeChange(!!checked)}
            />
            <label
              htmlFor="contribute"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {t("voting.volunteer_to_write")}
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
