"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Contribution } from "../common/types";
import { truncateAndSanitize } from "../common/utils";
import EnrichmentCompare from "../../EnrichmentCompare";
import dynamic from "next/dynamic";

// Import avec rendu côté client uniquement sans SSR
const PreviewRenderer = dynamic(
  () => import("@/components/shared/PreviewRenderer"),
  { ssr: false }
);

interface ContributionDetailProps {
  contribution: Contribution;
  onVoteContribution: (
    contributionId: number,
    postId: number | undefined,
    vote: "APPROVED" | "REJECTED",
    feedback: string
  ) => Promise<void>;
}

export function ContributionDetail({
  contribution,
  onVoteContribution,
}: ContributionDetailProps) {
  const { t } = useTranslation();
  const [voteFeedback, setVoteFeedback] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [parsedOriginalContent, setParsedOriginalContent] = useState("");
  const [parsedModifiedContent, setParsedModifiedContent] = useState("");

  // Utilisation d'un effet pour parser le contenu lorsqu'il change
  useEffect(() => {
    const parseContents = async () => {
      if (contribution?.original_content) {
        setParsedOriginalContent(contribution.original_content);
      }

      if (contribution?.content) {
        setParsedModifiedContent(contribution.content);
      }
    };

    parseContents();
  }, [contribution?.original_content, contribution?.content]);

  const handleVote = async (vote: "APPROVED" | "REJECTED") => {
    if (!contribution) return;
    if (!voteFeedback.trim()) {
      alert(t("voting.feedback_required"));
      return;
    }

    if (vote === "APPROVED") {
      setIsApproving(true);
    } else {
      setIsRejecting(true);
    }

    try {
      await onVoteContribution(
        contribution.id,
        contribution.post_id,
        vote,
        voteFeedback
      );
      setVoteFeedback("");
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête avec le titre et informations */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800 truncate">
              {contribution?.title?.length > 32
                ? contribution?.title?.substring(0, 32) + "..."
                : contribution?.title || ""}
            </h2>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                contribution.tag === "creation"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {contribution.tag === "creation"
                ? t("voting.creation")
                : t("voting.enrichment")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contribution.user.profilePicture} />
              <AvatarFallback>
                {truncateAndSanitize(contribution?.user?.fullName || "", 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-800 truncate">
                {truncateAndSanitize(contribution?.user?.fullName || "", 15)}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {t("voting.proposed_on", {
                  date: format(
                    new Date(contribution?.created_at || new Date()),
                    "d MMMM yyyy",
                    { locale: fr }
                  ),
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de contenu scrollable */}
      <div className="flex-1 overflow-hidden">
        {contribution.tag === "creation" ? (
          <div className="h-full flex flex-col">
            <div className="sticky top-0 z-10 bg-gray-50 py-2 border-b border-gray-200 flex-shrink-0">
              <div className="px-4 py-1.5 flex items-center space-x-2 justify-start">
                <span className="text-sm text-gray-500">
                  {t("voting.content")}:
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <PreviewRenderer
                editorContent={contribution?.content || ""}
                className="contribution-content tinymce-content"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <EnrichmentCompare
                originalContent={parsedOriginalContent}
                modifiedContent={parsedModifiedContent}
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
          {t("voting.vote_justification")}
        </label>
        <Textarea
          id="feedback"
          placeholder={t("voting.explain_decision")}
          className="w-full h-[2.5rem] text-sm mb-4"
          value={voteFeedback}
          onChange={(e) => setVoteFeedback(e.target.value)}
        />

        <div className="flex space-x-3">
          <Button
            className={`flex-1 ${
              contribution.tag === "creation"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white ${isApproving ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleVote("APPROVED")}
            disabled={isApproving}
          >
            {isApproving ? (
              <span className="flex items-center gap-2">
                <Loader size="sm" color="white" />
                {t("loading.default")}
              </span>
            ) : (
              t("voting.approve")
            )}
          </Button>
          <Button
            className={`flex-1 bg-red-600 hover:bg-red-700 text-white ${
              isRejecting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => handleVote("REJECTED")}
            disabled={isRejecting}
          >
            {isRejecting ? (
              <span className="flex items-center gap-2">
                <Loader size="sm" color="white" />
                {t("loading.default")}
              </span>
            ) : (
              t("voting.reject")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
