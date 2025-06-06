"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GoogleDocsStyleDiff from "@/components/shared/GoogleDocsStyleDiff";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  ArrowLeft,
  Columns,
  GitCompare,
  Loader,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface EnrichmentReviewProps {
  enrichmentId: number;
  postId: number;
  communityId: string;
  enrichmentTitle: string;
  originalContent: string;
  modifiedContent: string;
  authorName: string;
  authorId: number;
  existingReview?: {
    id: number;
    content: string;
    status: string;
  };
  description?: string;
}

export default function EnrichmentReview({
  enrichmentId,
  postId,
  communityId,
  enrichmentTitle,
  originalContent,
  modifiedContent,
  authorName,
  authorId,
  existingReview,
  description = "Modification du contenu",
}: EnrichmentReviewProps) {
  const router = useRouter();
  const [vote, setVote] = useState(existingReview?.status || "");
  const [comment, setComment] = useState(existingReview?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("suggestion"); // "suggestion" ou "parallel"
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!vote || !comment.trim()) return;

    setIsSubmitting(true);

    try {
      const endpoint = existingReview
        ? `/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/reviews/update`
        : `/api/communities/${communityId}/posts/${postId}/enrichments/${enrichmentId}/reviews`;

      const method = existingReview ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: vote,
          content: comment,
        }),
      });

      if (response.ok) {
        toast.success(t("enrichment_review.vote_success"));
        window.location.href = `/community/${communityId}?tab=voting`;
      } else {
        toast.error(t("enrichment_review.vote_error"));
      }
    } catch (error) {
      console.error(t("enrichment_review.error"), error);
      toast.error(t("enrichment_review.error_occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-white p-6 shadow-sm rounded-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {t("enrichment_review.title")} : {enrichmentTitle}
            </h1>
            <div className="text-gray-500 mt-1">
              {t("enrichment_review.proposed_by")} {authorName}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {t("enrichment_review.content_comparison")}
              </h2>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {t("enrichment_compare.display_mode")}:
                </span>
                <button
                  onClick={() => setViewMode("suggestion")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
                    viewMode === "suggestion"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  <span>{t("enrichment_compare.suggestion")}</span>
                </button>
                <button
                  onClick={() => setViewMode("parallel")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm ${
                    viewMode === "parallel"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span>{t("enrichment_compare.side_by_side")}</span>
                </button>
              </div>
            </div>

            {viewMode === "suggestion" && (
              <div className="border rounded-lg overflow-hidden">
                <GoogleDocsStyleDiff
                  oldHtml={originalContent}
                  newHtml={modifiedContent}
                  showControls={false}
                  readOnly={true}
                  description={t("enrichment_compare.proposed_changes")}
                />
              </div>
            )}

            {viewMode === "parallel" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-medium mb-2 text-gray-700">
                    {t("enrichment.original_content")}
                  </h3>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: originalContent }}
                  />
                </div>

                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h3 className="text-lg font-medium mb-2 text-blue-700">
                    {t("enrichment.modified_content")}
                  </h3>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: modifiedContent }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t">
            <h2 className="text-xl font-semibold mb-4">
              {t("enrichment_review.your_evaluation")}
            </h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button
                onClick={() => setVote("APPROVED")}
                className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  vote === "APPROVED"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <ThumbsUp
                  className={`w-5 h-5 ${
                    vote === "APPROVED" ? "text-green-600" : "text-gray-500"
                  }`}
                />
                <span className="font-medium">
                  {t("enrichment_review.approve_enrichment")}
                </span>
              </button>

              <button
                onClick={() => setVote("REJECTED")}
                className={`flex-1 p-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  vote === "REJECTED"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                <ThumbsDown
                  className={`w-5 h-5 ${
                    vote === "REJECTED" ? "text-red-600" : "text-gray-500"
                  }`}
                />
                <span className="font-medium">
                  {t("enrichment_review.reject_enrichment")}
                </span>
              </button>
            </div>

            <div className="mb-6">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("enrichment_review.comment_required")}
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                placeholder={t("enrichment_review.comment_placeholder")}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!vote || !comment.trim() || isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>{t("enrichment_review.submitting")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{t("enrichment_review.submit_evaluation")}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/community/${communityId}/posts/${postId}`)
              }
            >
              {t("enrichment_edit.back_to_post")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
