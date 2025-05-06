"use client";

import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TopicProposal } from "../common/types";

interface ProposalsOverviewProps {
  proposals: TopicProposal[];
}

export function ProposalsOverview({ proposals }: ProposalsOverviewProps) {
  const { t } = useTranslation();

  // Compter les propositions par statut
  const pendingCount = proposals.filter((p) => p.status === "pending").length;
  const approvedCount = proposals.filter((p) => p.status === "approved").length;
  const rejectedCount = proposals.filter((p) => p.status === "rejected").length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {t("voting.topic_proposals")}
        </h2>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">
            {t("voting.pending_topics")}
          </span>
          <div className="w-3 h-3 rounded-full bg-green-500 ml-4"></div>
          <span className="text-sm font-medium">
            {t("voting.approved_topics")}
          </span>
          <div className="w-3 h-3 rounded-full bg-red-500 ml-4"></div>
          <span className="text-sm font-medium">
            {t("voting.rejected_topics")}
          </span>
        </div>
        <p className="text-gray-600">
          {t("voting.proposals_explanation") ||
            "Les propositions de sujets sont des idées soumises par la communauté pour créer de nouveaux contenus. Votez pour celles que vous souhaitez voir développées."}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("voting.proposal_stats")}</CardTitle>
          <CardDescription>
            {t("voting.community_proposals_overview") ||
              "Aperçu des propositions de sujets dans cette communauté"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-amber-600">
                {pendingCount}
              </span>
              <p className="text-sm text-gray-500">{t("voting.pending")}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">
                {approvedCount}
              </span>
              <p className="text-sm text-gray-500">{t("voting.approved")}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-red-600">
                {rejectedCount}
              </span>
              <p className="text-sm text-gray-500">{t("voting.rejected")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
