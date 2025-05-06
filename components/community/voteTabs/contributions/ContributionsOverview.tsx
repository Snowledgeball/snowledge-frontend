"use client";

import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Contribution } from "../common/types";

interface ContributionsOverviewProps {
  contributions: Contribution[];
}

export function ContributionsOverview({
  contributions,
}: ContributionsOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {t("voting.community_contributions")}
        </h2>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm font-medium">
            {t("voting.content_creation")}
          </span>
          <div className="w-3 h-3 rounded-full bg-blue-500 ml-4"></div>
          <span className="text-sm font-medium">{t("voting.enrichment")}</span>
          <div className="w-3 h-3 rounded-full bg-amber-500 ml-4"></div>
          <span className="text-sm font-medium">
            {t("voting.pending_review")}
          </span>
        </div>
        <p className="text-gray-600">{t("voting.contributions_explanation")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("voting.contribution_stats")}</CardTitle>
          <CardDescription>
            {t("voting.community_contributions_overview")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-purple-600">
                {contributions.filter((c) => c.tag === "creation").length}
              </span>
              <p className="text-sm text-gray-500">{t("voting.creations")}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {contributions.filter((c) => c.tag === "enrichment").length}
              </span>
              <p className="text-sm text-gray-500">{t("voting.enrichments")}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-amber-600">
                {contributions.length}
              </span>
              <p className="text-sm text-gray-500">{t("voting.pending")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
