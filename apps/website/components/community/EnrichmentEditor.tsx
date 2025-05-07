"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import PostEditorContainer from "./PostEditorContainer";
import PreviewRenderer from "../shared/PreviewRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface EnrichmentEditorProps {
  originalContent: string;
  initialModifiedContent?: string;
  description: string;
  onDescriptionChange: (desc: string) => void;
  onContentChange: (content: string) => void;
  communityId: string;
}

export default function EnrichmentEditor({
  originalContent,
  initialModifiedContent,
  description,
  onDescriptionChange,
  onContentChange,
  communityId,
}: EnrichmentEditorProps) {
  const [modifiedContent, setModifiedContent] = useState(
    initialModifiedContent || originalContent
  );
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("modification");

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
    <div className="enrichment-editor space-y-6">
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
        />
        {!description && (
          <p className="text-sm text-red-500 mt-1">
            {t("enrichment.description_required")}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Tabs
          defaultValue="modification"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-gray-200">
            <TabsList className="w-full flex h-auto bg-gray-50">
              <TabsTrigger
                value="original"
                className="flex-1 py-3 text-base font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                {t("enrichment.original_content")}
              </TabsTrigger>
              <TabsTrigger
                value="modification"
                className="flex-1 py-3 text-base font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                {t("enrichment.modified_content")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="original" className="p-6 min-h-[400px]">
            <PreviewRenderer
              editorContent={originalContent}
              className="prose max-w-none"
            />
          </TabsContent>

          <TabsContent value="modification" className="p-6 min-h-[400px]">
            <PostEditorContainer
              onlyContent={true}
              onContentChange={handleContentChange}
              initialData={{
                content: modifiedContent,
                title: "",
                cover_image_url: "",
                tag: "",
                accept_contributions: false,
              }}
              communityId={communityId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
