"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import TinyMCEStyledText from "../shared/TinyMCEStyledText";
import { useTranslation } from "react-i18next";

const TinyEditor = dynamic(() => import("../shared/TinyEditor"), {
  ssr: false,
});

interface EnrichmentEditorProps {
  originalContent: string;
  initialModifiedContent?: string;
  description: string;
  onDescriptionChange: (desc: string) => void;
  onContentChange: (content: string) => void;
  readOnly?: boolean;
}

export default function EnrichmentEditor({
  originalContent,
  initialModifiedContent,
  description,
  onDescriptionChange,
  onContentChange,
  readOnly = false,
}: EnrichmentEditorProps) {
  const [modifiedContent, setModifiedContent] = useState(
    initialModifiedContent || originalContent
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (initialModifiedContent) {
      setModifiedContent(initialModifiedContent);
    }
  }, [initialModifiedContent]);

  const handleContentChange = (content: string) => {
    setModifiedContent(content);
    onContentChange(content);
  };

  return (
    <div className="enrichment-editor">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {t("enrichment.description_title")}
        </h2>
        <div className="mb-2 text-sm text-gray-600">
          <p className="mb-1">{t("enrichment.description_instruction")}</p>
          <p className="mb-1">{t("enrichment.format_example")}</p>
          <ul className="list-disc pl-5 mb-2">
            <li>{t("enrichment.example1")}</li>
            <li>{t("enrichment.example2")}</li>
            <li>{t("enrichment.example3")}</li>
          </ul>
        </div>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t("enrichment.description_placeholder")}
          className="w-full p-3 border rounded-md"
          rows={3}
          disabled={readOnly}
        />
        {!description && (
          <p className="text-sm text-red-500 mt-1">
            {t("enrichment.description_required")}
          </p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t("enrichment.original_content")}
          </h2>
          <TinyMCEStyledText content={originalContent} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t("enrichment.modified_content")}
          </h2>
          {readOnly ? (
            <TinyMCEStyledText content={modifiedContent} />
          ) : (
            <TinyEditor
              initialValue={modifiedContent}
              onChange={handleContentChange}
              protectImages={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
