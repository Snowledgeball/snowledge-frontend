"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import TinyEditor from "@/components/shared/TinyEditor";
import GoogleDocsStyleDiff from "@/components/shared/GoogleDocsStyleDiff";
import { Button } from "@/components/ui/button";

interface EnrichmentEditorProps {
    originalContent: string;
    initialModifiedContent?: string;
    description: string;
    onDescriptionChange: (description: string) => void;
    onContentChange: (content: string) => void;
    readOnly?: boolean;
}

export default function EnrichmentEditor({
    originalContent,
    initialModifiedContent,
    description,
    onDescriptionChange,
    onContentChange,
    readOnly = false
}: EnrichmentEditorProps) {
    const [modifiedContent, setModifiedContent] = useState(initialModifiedContent || originalContent);
    const [previewMode, setPreviewMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Vérifier s'il y a des changements
        setHasChanges(originalContent !== modifiedContent);

        // Notifier le parent des changements
        onContentChange(modifiedContent);
    }, [modifiedContent, originalContent, onContentChange]);

    const handleEditorChange = (content: string) => {
        setModifiedContent(content);
    };

    return (
        <div className="enrichment-editor">
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description de vos modifications</h2>
                <div className="mb-2 text-sm text-gray-600">
                    <p className="mb-1">Décrivez brièvement les modifications que vous proposez et leur raison.</p>
                    <p className="mb-1">Exemple de format :</p>
                    <ul className="list-disc pl-5 mb-2">
                        <li>Correction de faute d'orthographe</li>
                        <li>Ajout d'information sur...</li>
                        <li>Restructuration de la section...</li>
                    </ul>
                </div>
                <textarea
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Décrivez vos modifications ici..."
                    className="w-full p-3 border rounded-md"
                    rows={3}
                    disabled={readOnly}
                />
                {!description && (
                    <p className="text-sm text-red-500 mt-1">
                        Une description de vos modifications est requise
                    </p>
                )}
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Éditeur de contenu</h2>
                    {!readOnly && (
                        <div className="flex space-x-2">
                            <Button
                                variant={previewMode ? "outline" : "default"}
                                size="sm"
                                onClick={() => setPreviewMode(false)}
                            >
                                Éditer
                            </Button>
                            <Button
                                variant={previewMode ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPreviewMode(true)}
                                disabled={!hasChanges}
                            >
                                Prévisualiser les changements
                            </Button>
                        </div>
                    )}
                </div>

                {previewMode || readOnly ? (
                    <div className="border rounded-md p-4">
                        <GoogleDocsStyleDiff
                            oldHtml={originalContent}
                            newHtml={modifiedContent}
                            showControls={!readOnly}
                            readOnly={true}
                            description={description}
                        />
                    </div>
                ) : (
                    <TinyEditor
                        initialValue={modifiedContent}
                        onChange={handleEditorChange}
                    />
                )}

                {!hasChanges && !readOnly && (
                    <p className="text-sm text-red-500 mt-1">
                        Vous n'avez pas encore apporté de modifications au contenu
                    </p>
                )}
            </div>
        </div>
    );
} 