"use client"; // this registers <Editor> as a Client Component

import React, { useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

// Type pour le contenu de l'éditeur
type EditorContent = string; // Contenu HTML

interface TextEditorProps {
  value: EditorContent | null; // Contenu HTML initial
  onChange: (value: EditorContent) => void; // Fonction pour mettre à jour le contenu HTML
  onGetFullHTML?: (html: string) => void; // Callback pour récupérer le HTML complet
  onGetHTML?: (html: string) => void; // Callback pour récupérer le HTML simple
}

export function TextEditor({ value, onChange }: TextEditorProps) {
  const [editorContent, setEditorContent] = useState<string>("");

  // Creates a new editor instance
  const editor = useCreateBlockNote({
    initialContent: value ? JSON.parse(value) : undefined,
  });

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
