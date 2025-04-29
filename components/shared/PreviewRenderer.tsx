"use client";

import { useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";

interface PreviewRendererProps {
  editorContent: string;
  onHtmlGenerated: (html: string) => void;
}

export default function PreviewRenderer({
  editorContent,
  onHtmlGenerated,
}: PreviewRendererProps) {
  // Ce composant ne s'exécutera que côté client grâce à l'importation dynamique avec ssr: false
  const editor = useCreateBlockNote();

  useEffect(() => {
    const convertContentToHtml = async () => {
      try {
        // Vérifier que le contenu est au format JSON
        if (
          editorContent &&
          typeof editorContent === "string" &&
          editorContent.trim().startsWith("[")
        ) {
          const blocks = JSON.parse(editorContent);
          const fullHtml = await editor.blocksToFullHTML(blocks);
          onHtmlGenerated(fullHtml);
        } else {
          onHtmlGenerated(editorContent);
        }
      } catch (error) {
        console.error("Erreur lors de la conversion du contenu:", error);
        onHtmlGenerated(editorContent);
      }
    };

    convertContentToHtml();
  }, [editorContent, editor, onHtmlGenerated]);

  // Ce composant ne rend rien visuellement, il ne fait que traiter le contenu
  return null;
}
