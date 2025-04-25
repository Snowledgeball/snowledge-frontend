"use client"; // this registers <Editor> as a Client Component

import React, { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

// Type pour le contenu de l'éditeur
type EditorContent = string;

interface TextEditorProps {
  value: EditorContent;
  onChange: (content: EditorContent) => void;
}

export function TextEditor({ value, onChange }: TextEditorProps) {
  const [editorContent, setEditorContent] = useState<string>("");

  // Détecter si la valeur est du JSON valide ou du HTML
  const isJsonContent =
    value && typeof value === "string" && value.trim().startsWith("[");

  // Creates a new editor instance
  const editor = useCreateBlockNote({
    initialContent: isJsonContent ? JSON.parse(value) : undefined,
  });

  // Si le contenu initial n'était pas du JSON valide et que c'est du HTML,
  // nous devons convertir le HTML en blocs BlockNote
  useEffect(() => {
    const initializeWithHtml = async () => {
      if (
        !isJsonContent &&
        value &&
        typeof value === "string" &&
        value.trim().startsWith("<")
      ) {
        try {
          // Si c'est du HTML, utiliser l'API de conversion HTML de BlockNote
          const blocks = await editor.tryParseHTMLToBlocks(value);
          editor.replaceBlocks(editor.document, blocks);
        } catch (error) {
          console.error("Erreur lors de la conversion HTML en blocs:", error);
        }
      }
    };

    initializeWithHtml();
  }, [editor, value, isJsonContent]);

  // Synchroniser l'éditeur avec le state externe
  useEffect(() => {
    // Fonction pour mettre à jour le state parent avec du HTML
    const updateHTMLContent = async () => {
      try {
        const text = JSON.stringify(editor.document);

        // Ne mettre à jour que si le contenu a changé
        if (text !== editorContent) {
          setEditorContent(text);
          onChange(text);
        }
      } catch (error) {
        console.error("Erreur lors de la conversion en HTML:", error);
      }
    };

    // Observer les changements
    const intervalId = setInterval(updateHTMLContent, 500);
    return () => clearInterval(intervalId);
  }, [editor, onChange, editorContent]);

  // Boutons pour obtenir le HTML
  return (
    <div>
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
}
