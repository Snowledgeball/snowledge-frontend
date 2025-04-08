"use client";

import { Columns, GitCompare } from "lucide-react";
import { useState } from "react";
import GoogleDocsStyleDiff from "@/components/shared/GoogleDocsStyleDiff";

interface EnrichmentCompareProps {
  originalContent: string;
  modifiedContent: string;
}

export default function EnrichmentCompare({
  originalContent,
  modifiedContent,
}: EnrichmentCompareProps) {
  const [viewMode, setViewMode] = useState<"suggestion" | "parallel">(
    "suggestion"
  );
  return (
    <div className="flex flex-col h-full">
      {/* En-tête fixe avec les boutons de mode d'affichage */}
      <div className="sticky top-0 z-10 bg-gray-50 py-2 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 justify-end">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Mode d'affichage:
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
            <span>Suggestion</span>
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
            <span>Côte à côte</span>
          </button>
        </div>
      </div>

      {/* Conteneur avec défilement pour le contenu */}
      <div className="flex-1 overflow-auto">
        {viewMode === "suggestion" && (
          <div className="px-4 pt-4">
            <GoogleDocsStyleDiff
              oldHtml={originalContent}
              newHtml={modifiedContent}
              showControls={false}
              readOnly={true}
              description="Modifications proposées"
            />
          </div>
        )}

        {viewMode === "parallel" && (
          <div className="px-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium mb-2 text-gray-700 truncate">
                  Contenu original
                </h3>
                <div
                  className="tinymce-content prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: originalContent }}
                />
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-medium mb-2 text-blue-700 truncate">
                  Contenu modifié
                </h3>
                <div
                  className="tinymce-content prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: modifiedContent }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
