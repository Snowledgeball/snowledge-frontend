"use client";

import { useState, useEffect } from 'react';
import { generateHtmlDiff, generateSideBySideDiff, DiffResult } from '@/lib/diffUtils';

interface InlineDiffViewerProps {
    oldHtml: string;
    newHtml: string;
    showControls?: boolean;
}

export default function InlineDiffViewer({
    oldHtml,
    newHtml,
    showControls = true
}: InlineDiffViewerProps) {
    const [viewMode, setViewMode] = useState<'diff' | 'original' | 'modified' | 'side-by-side'>('diff');
    const [diffResult, setDiffResult] = useState<DiffResult>({ html: '', hasChanges: false });
    const [sideBySideHtml, setSideBySideHtml] = useState<string>('');

    useEffect(() => {
        try {
            if (viewMode === 'diff') {
                const result = generateHtmlDiff(oldHtml, newHtml);
                setDiffResult(result);
            } else if (viewMode === 'side-by-side') {
                const html = generateSideBySideDiff(oldHtml, newHtml);
                setSideBySideHtml(html);
            }
        } catch (error) {
            console.error('Erreur lors de la génération des différences:', error);
            // En cas d'erreur, afficher le contenu modifié
            setDiffResult({ html: newHtml, hasChanges: true });
        }
    }, [oldHtml, newHtml, viewMode]);

    return (
        <div className="inline-diff-viewer">
            {showControls && (
                <div className="flex space-x-2 mb-4 border-b">
                    <button
                        className={`px-4 py-2 ${viewMode === 'diff' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setViewMode('diff')}
                    >
                        Différences
                    </button>
                    <button
                        className={`px-4 py-2 ${viewMode === 'side-by-side' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setViewMode('side-by-side')}
                    >
                        Côte à côte
                    </button>
                    <button
                        className={`px-4 py-2 ${viewMode === 'original' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setViewMode('original')}
                    >
                        Contenu original
                    </button>
                    <button
                        className={`px-4 py-2 ${viewMode === 'modified' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => setViewMode('modified')}
                    >
                        Contenu modifié
                    </button>
                </div>
            )}

            <div className="border rounded-lg p-4">
                {viewMode === 'diff' && (
                    <div
                        className="diff-content"
                        dangerouslySetInnerHTML={{ __html: diffResult.html }}
                    />
                )}

                {viewMode === 'side-by-side' && (
                    <div
                        className="side-by-side-content"
                        dangerouslySetInnerHTML={{ __html: sideBySideHtml }}
                    />
                )}

                {viewMode === 'original' && (
                    <div dangerouslySetInnerHTML={{ __html: oldHtml }} />
                )}

                {viewMode === 'modified' && (
                    <div dangerouslySetInnerHTML={{ __html: newHtml }} />
                )}
            </div>

            {viewMode === 'diff' && !diffResult.hasChanges && (
                <p className="text-sm text-gray-500 mt-2">
                    Aucune différence détectée entre les deux versions.
                </p>
            )}
        </div>
    );
} 