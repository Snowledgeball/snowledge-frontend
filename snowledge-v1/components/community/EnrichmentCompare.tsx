"use client";

import { Columns, GitCompare } from "lucide-react";
import { useState, useEffect } from "react";
// Commenté temporairement pour désactiver le mode suggestion
// import GoogleDocsStyleDiff from "@/components/shared/GoogleDocsStyleDiff";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";

// Import avec rendu côté client uniquement
const DynamicPreviewRenderer = dynamic(
  () => import("@/components/shared/PreviewRenderer"),
  { ssr: false }
);

interface EnrichmentCompareProps {
  originalContent: string;
  modifiedContent: string;
}

export default function EnrichmentCompare({
  originalContent,
  modifiedContent,
}: EnrichmentCompareProps) {
  const { t } = useTranslation();
  // Force le mode parallel uniquement
  const [viewMode, setViewMode] = useState<"suggestion" | "parallel">(
    "parallel"
  );

  // États pour stocker les versions HTML générées par PreviewRenderer
  const [parsedOriginalContent, setParsedOriginalContent] = useState("");
  const [parsedModifiedContent, setParsedModifiedContent] = useState("");

  // Fonction pour récupérer le HTML généré par PreviewRenderer
  const handleOriginalHtmlGenerated = (html: string) => {
    setParsedOriginalContent(html);
  };

  const handleModifiedHtmlGenerated = (html: string) => {
    setParsedModifiedContent(html);
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête fixe avec les boutons de mode d'affichage - COMMENTÉ TEMPORAIREMENT */}
      {/* 
      <div className="sticky top-0 z-10 bg-gray-50 py-2 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 justify-end">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {t("enrichment_compare.display_mode")}:
          </span>
          <button
            onClick={() => setViewMode("suggestion")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm whitespace-nowrap ${
              viewMode === "suggestion"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <GitCompare className="w-4 h-4 flex-shrink-0" />
            <span>{t("enrichment_compare.suggestion")}</span>
          </button>
          <button
            onClick={() => setViewMode("parallel")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm whitespace-nowrap ${
              viewMode === "parallel"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Columns className="w-4 h-4 flex-shrink-0" />
            <span>{t("enrichment_compare.side_by_side")}</span>
          </button>
        </div>
      </div>
      */}

      {/* Conteneur avec défilement pour le contenu */}
      <div className="flex-1 overflow-auto">
        {/* Invisibles PreviewRenderers pour générer le HTML */}
        <div className="hidden">
          <DynamicPreviewRenderer
            editorContent={originalContent}
            onHtmlGenerated={handleOriginalHtmlGenerated}
            showLoading={false}
          />
          <DynamicPreviewRenderer
            editorContent={modifiedContent}
            onHtmlGenerated={handleModifiedHtmlGenerated}
            showLoading={false}
          />
        </div>

        {/* Mode suggestion commenté temporairement */}
        {/*
        {viewMode === "suggestion" && (
          <div className="px-4 pt-4">
            <GoogleDocsStyleDiff
              oldHtml={parsedOriginalContent}
              newHtml={parsedModifiedContent}
              showControls={false}
              readOnly={true}
              description={t("enrichment_compare.proposed_changes")}
            />
          </div>
        )}
        */}

        {/* Toujours afficher le mode parallel */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-2 text-gray-700 truncate">
                {t("enrichment.original_content")}
              </h3>
              <DynamicPreviewRenderer
                editorContent={originalContent}
                className="tinymce-content prose max-w-none"
              />
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-medium mb-2 text-blue-700 truncate">
                {t("enrichment.modified_content")}
              </h3>
              <DynamicPreviewRenderer
                editorContent={modifiedContent}
                className="tinymce-content prose max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
