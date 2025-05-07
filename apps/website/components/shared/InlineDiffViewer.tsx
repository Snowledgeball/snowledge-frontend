"use client";

import { useState, useEffect } from "react";
import {
  generateHtmlDiff,
  generateSideBySideDiff,
  DiffResult,
} from "@/lib/diffUtils";
import { useTranslation } from "react-i18next";

interface InlineDiffViewerProps {
  oldHtml: string;
  newHtml: string;
  showControls?: boolean;
}

export default function InlineDiffViewer({
  oldHtml,
  newHtml,
  showControls = true,
}: InlineDiffViewerProps) {
  const [viewMode, setViewMode] = useState<
    "diff" | "original" | "modified" | "side-by-side"
  >("diff");
  const [diffResult, setDiffResult] = useState<DiffResult>({
    html: "",
    hasChanges: false,
  });
  const [sideBySideHtml, setSideBySideHtml] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    try {
      if (viewMode === "diff") {
        const result = generateHtmlDiff(oldHtml, newHtml);
        setDiffResult(result);
      } else if (viewMode === "side-by-side") {
        const html = generateSideBySideDiff(oldHtml, newHtml);
        setSideBySideHtml(html);
      }
    } catch (error) {
      console.error(t("inline_diff.generation_error"), error);
      // En cas d'erreur, afficher le contenu modifié
      setDiffResult({ html: newHtml, hasChanges: true });
    }
  }, [oldHtml, newHtml, viewMode, t]);

  return (
    <div className="inline-diff-viewer">
      {showControls && (
        <div className="flex space-x-2 mb-4 border-b">
          <button
            className={`px-4 py-2 ${
              viewMode === "diff"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("diff")}
          >
            {t("inline_diff.differences")}
          </button>
          <button
            className={`px-4 py-2 ${
              viewMode === "side-by-side"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("side-by-side")}
          >
            {t("enrichment_compare.side_by_side")}
          </button>
          <button
            className={`px-4 py-2 ${
              viewMode === "original"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("original")}
          >
            {t("enrichment.original_content")}
          </button>
          <button
            className={`px-4 py-2 ${
              viewMode === "modified"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setViewMode("modified")}
          >
            {t("enrichment.modified_content")}
          </button>
        </div>
      )}

      <div className="border rounded-lg p-4">
        {viewMode === "diff" && (
          <div
            className="diff-content"
            dangerouslySetInnerHTML={{ __html: diffResult.html }}
          />
        )}

        {viewMode === "side-by-side" && (
          <div
            className="side-by-side-content"
            dangerouslySetInnerHTML={{ __html: sideBySideHtml }}
          />
        )}

        {viewMode === "original" && (
          <div dangerouslySetInnerHTML={{ __html: oldHtml }} />
        )}

        {viewMode === "modified" && (
          <div dangerouslySetInnerHTML={{ __html: newHtml }} />
        )}
      </div>

      {viewMode === "diff" && !diffResult.hasChanges && (
        <p className="text-sm text-gray-500 mt-2">
          {t("inline_diff.no_differences")}
        </p>
      )}
    </div>
  );
}
