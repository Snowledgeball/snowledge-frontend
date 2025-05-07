"use client";

import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import "@blocknote/core/style.css";

interface PreviewRendererProps {
  editorContent: string;
  onHtmlGenerated?: (html: string) => void;
  className?: string;
  showLoading?: boolean;
}

export default function PreviewRenderer({
  editorContent,
  onHtmlGenerated,
  className,
  showLoading = true,
}: PreviewRendererProps) {
  const editor = useCreateBlockNote();
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const processHtml = (htmlContent: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    const colorElements = tempDiv.querySelectorAll("[data-text-color]");
    colorElements.forEach((el) => {
      const color = el.getAttribute("data-text-color");
      if (color) {
        (el as HTMLElement).style.color = color;
      }
    });

    const bgColorElements = tempDiv.querySelectorAll("[data-bg-color]");
    bgColorElements.forEach((el) => {
      const color = el.getAttribute("data-bg-color");
      if (color) {
        (el as HTMLElement).style.backgroundColor = color;
      }
    });

    const styleElements = tempDiv.querySelectorAll("[data-text-style]");
    styleElements.forEach((el) => {
      const style = el.getAttribute("data-text-style");
      if (style === "bold") {
        (el as HTMLElement).style.fontWeight = "bold";
      } else if (style === "italic") {
        (el as HTMLElement).style.fontStyle = "italic";
      } else if (style === "underline") {
        (el as HTMLElement).style.textDecoration = "underline";
      } else if (style === "strikethrough") {
        (el as HTMLElement).style.textDecoration = "line-through";
      }
    });

    const fontElements = tempDiv.querySelectorAll("[data-font-family]");
    fontElements.forEach((el) => {
      const font = el.getAttribute("data-font-family");
      if (font) {
        (el as HTMLElement).style.fontFamily = font;
      }
    });

    const sizeElements = tempDiv.querySelectorAll("[data-font-size]");
    sizeElements.forEach((el) => {
      const size = el.getAttribute("data-font-size");
      if (size) {
        (el as HTMLElement).style.fontSize = size;
      }
    });

    return tempDiv.innerHTML;
  };

  useEffect(() => {
    const convertContentToHtml = async () => {
      try {
        setIsLoading(true);

        if (
          editorContent &&
          typeof editorContent === "string" &&
          editorContent.trim().startsWith("[")
        ) {
          const blocks = JSON.parse(editorContent);
          const rawHtml = await editor.blocksToFullHTML(blocks);

          const processedHtml =
            typeof window !== "undefined" ? processHtml(rawHtml) : rawHtml;

          setHtml(processedHtml);
          if (onHtmlGenerated) {
            onHtmlGenerated(processedHtml);
          }
        } else {
          setHtml(editorContent);
          if (onHtmlGenerated) {
            onHtmlGenerated(editorContent);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la conversion du contenu:", error);
        setHtml(editorContent);
        if (onHtmlGenerated) {
          onHtmlGenerated(editorContent);
        }
      } finally {
        setIsLoading(false);
      }
    };

    convertContentToHtml();
  }, [editorContent, editor, onHtmlGenerated]);

  return (
    <div className={cn("preview-renderer", className)}>
      {isLoading && showLoading ? (
        <div className="flex justify-center items-center py-4">
          <Loader color="gradient" size="sm" variant="spinner" />
        </div>
      ) : (
        <div
          className="prose max-w-none preview-content bn-container"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
