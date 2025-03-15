"use client";

import React, { useState, useEffect } from 'react';
import DiffMatchPatch from 'diff-match-patch';
import parse from 'html-react-parser';

// Types pour diff-match-patch
type DiffOperation = -1 | 0 | 1;
type Diff = [DiffOperation, string];

interface GoogleDocsStyleDiffProps {
    oldHtml: string;
    newHtml: string;
    showControls?: boolean;
    onApprove?: (feedback: string) => void;
    onReject?: (feedback: string) => void;
    readOnly?: boolean;
    description?: string;
}

export default function GoogleDocsStyleDiff({
    oldHtml,
    newHtml,
    showControls = true,
    onApprove,
    onReject,
    readOnly = false,
    description = "Modification du contenu"
}: GoogleDocsStyleDiffProps) {
    // Nous gardons uniquement le mode 'suggestions' et supprimons les autres modes
    const [processedHtml, setProcessedHtml] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);

    useEffect(() => {
        // Traiter le HTML pour afficher les différences dans le style Google Docs
        const html = advancedDiffHtml(oldHtml, newHtml);
        setProcessedHtml(html);
    }, [oldHtml, newHtml]);

    // Nouvelle fonction avancée pour générer le HTML des différences
    const advancedDiffHtml = (oldHtml: string, newHtml: string): string => {
        if (oldHtml === newHtml) return oldHtml;

        try {
            // Styles CSS pour les différences
            const styles = `
                <style>
                    .diff-added {
                        background-color: rgba(204, 255, 204, 0.5);
                        border-bottom: 1px solid #4caf50;
                        padding: 0 2px;
                    }
                    .diff-removed {
                        background-color: rgba(255, 204, 204, 0.5);
                        border-bottom: 1px solid #f44336;
                        padding: 0 2px;
                        text-decoration: line-through;
                    }
                    /* Styles pour les paragraphes entiers */
                    p.diff-added, div.diff-added {
                        border-left: 3px solid #4caf50;
                        padding-left: 5px;
                        margin-left: -5px;
                    }
                    p.diff-removed, div.diff-removed {
                        border-left: 3px solid #f44336;
                        padding-left: 5px;
                        margin-left: -5px;
                    }
                    /* Style pour contrôler l'espacement des sauts de ligne */
                    .newline-marker {
                        display: block;
                        margin: 0;
                        padding: 0;
                        line-height: 1;
                        height: 1.2em;
                    }
                    /* Style pour le texte ajouté après un saut de ligne */
                    .added-after-break {
                        background-color: rgba(204, 255, 204, 0.5);
                        border-left: 3px solid #4caf50;
                        padding-left: 5px;
                        padding-right: 1px;
                        margin-right: 1px;
                        font-weight: bold;
                        display: inline-block;
                    }
                </style>
            `;

            // Approche complètement différente : traiter le HTML comme du texte brut
            // et utiliser des marqueurs spéciaux pour les balises

            // 1. Prétraitement : nettoyer uniquement les attributs data-start et data-end
            const cleanTokens = (html: string): string => {
                // Nettoyer uniquement les attributs data-start et data-end
                let cleaned = html;
                cleaned = cleaned.replace(/\s+data-start="[^"]*"/g, '');
                cleaned = cleaned.replace(/\s+data-end="[^"]*"/g, '');
                cleaned = cleaned.replace(/\s+data-start='[^']*'/g, '');
                cleaned = cleaned.replace(/\s+data-end='[^']*'/g, '');
                cleaned = cleaned.replace(/\s+data-start=\d+/g, '');
                cleaned = cleaned.replace(/\s+data-end=\d+/g, '');

                // Nettoyer les tokens qui pourraient exister
                cleaned = cleaned.replace(/TOKEN_\d+/g, '');
                cleaned = cleaned.replace(/__TOKEN_\d+__/g, '');
                cleaned = cleaned.replace(/HTMLTAG_\d+/g, '');

                return cleaned;
            };

            const cleanOldHtml = cleanTokens(oldHtml);
            const cleanNewHtml = cleanTokens(newHtml);

            // 2. Comparer directement les textes nettoyés
            const dmp = new DiffMatchPatch();
            const diffs = dmp.diff_main(cleanOldHtml, cleanNewHtml);
            dmp.diff_cleanupSemantic(diffs);

            // 3. Générer le HTML avec les différences marquées
            let result = '';
            for (const [op, text] of diffs) {
                if (op === -1) {
                    // Texte supprimé - marquer les sauts de ligne sans les remplacer
                    let processedText = text;

                    // Marquer uniquement les sauts de ligne avec un symbole, sans créer de paragraphes
                    processedText = processedText.replace(/\n/g, '<span style="display: inline-block; background-color: rgba(255, 204, 204, 0.8); border: 1px solid #f44336; border-radius: 3px; padding: 0 3px; margin: 0 2px; font-size: 0.8em; vertical-align: middle;">↵</span> ');

                    result += `<span class="diff-removed">${processedText}</span>`;
                } else if (op === 1) {
                    // Texte ajouté - marquer les sauts de ligne et mettre en évidence le texte qui suit
                    let processedText = text;

                    // Traiter les sauts de ligne en remplaçant chaque ligne par un paragraphe
                    if (processedText.includes('\n')) {
                        const lines = processedText.split('\n');
                        processedText = lines.map((line, index) => {
                            if (index === 0) {
                                // Première ligne : pas de style spécial
                                if (index < lines.length - 1) {
                                    return `<p style="margin: 0; padding: 0;">${line}<span style="display: inline-block; background-color: rgba(204, 255, 204, 0.8); border: 1px solid #4caf50; border-radius: 3px; padding: 0 3px; margin: 0 2px; font-size: 0.8em; vertical-align: middle;">↵</span></p>`;
                                }
                                return `<p style="margin: 0; padding: 0;">${line}</p>`;
                            } else {
                                // Lignes suivantes : ajouter le style avec la barre verte
                                if (index < lines.length - 1) {
                                    // Ligne avec saut de ligne à la fin
                                    return `<div style="margin: 0; padding: 0; border-left: 3px solid #4caf50; padding-left: 5px; background-color: rgba(204, 255, 204, 0.5);">${line}<span style="display: inline-block; background-color: rgba(204, 255, 204, 0.8); border: 1px solid #4caf50; border-radius: 3px; padding: 0 3px; margin: 0 2px; font-size: 0.8em; vertical-align: middle;">↵</span></div>`;
                                }
                                // Dernière ligne ou ligne unique
                                return `<div style="margin: 0; padding: 0; border-left: 3px solid #4caf50; padding-left: 5px; background-color: rgba(204, 255, 204, 0.5);">${line}</div>`;
                            }
                        }).join('');
                    }

                    result += `<span class="diff-added">${processedText}</span>`;
                } else {
                    // Texte inchangé - laisser tel quel
                    result += text;
                }
            }

            // 4. Nettoyage final pour éliminer tous les tokens résiduels
            const finalCleanup = (html: string): string => {
                // Nettoyer uniquement les attributs data-start et data-end
                let cleaned = html;
                cleaned = cleaned.replace(/\s+data-start="[^"]*"/g, '');
                cleaned = cleaned.replace(/\s+data-end="[^"]*"/g, '');
                cleaned = cleaned.replace(/\s+data-start='[^']*'/g, '');
                cleaned = cleaned.replace(/\s+data-end='[^']*'/g, '');
                cleaned = cleaned.replace(/\s+data-start=\d+/g, '');
                cleaned = cleaned.replace(/\s+data-end=\d+/g, '');

                // Nettoyer les tokens qui pourraient exister
                cleaned = cleaned.replace(/TOKEN_\d+/g, '');
                cleaned = cleaned.replace(/__TOKEN_\d+__/g, '');
                cleaned = cleaned.replace(/HTMLTAG_\d+/g, '');

                return cleaned;
            };

            // Appliquer le nettoyage final
            result = finalCleanup(result);

            // 5. Nettoyer les spans imbriqués inutiles
            result = result.replace(/<span class="diff-added"><span class="diff-added">(.*?)<\/span><\/span>/g, '<span class="diff-added">$1</span>');
            result = result.replace(/<span class="diff-removed"><span class="diff-removed">(.*?)<\/span><\/span>/g, '<span class="diff-removed">$1</span>');

            return styles + result;
        } catch (error) {
            console.error("Erreur lors de la génération des différences avancées:", error);

            // En cas d'erreur, utiliser une approche encore plus simple
            try {
                // Nettoyer tous les tokens avant de comparer
                const cleanTokens = (html: string): string => {
                    let cleaned = html;
                    cleaned = cleaned.replace(/__HTMLTAG_\d+__/g, '');
                    cleaned = cleaned.replace(/__DATAATTR_\d+__/g, '');
                    cleaned = cleaned.replace(/_TOKEN_\d+_/g, '');
                    cleaned = cleaned.replace(/TOKEN_\d+/g, '');
                    cleaned = cleaned.replace(/__TOKEN_\d+__/g, '');
                    cleaned = cleaned.replace(/[_]+HTMLTAG[_]+\d+[_]+/g, '');
                    cleaned = cleaned.replace(/HTMLTAG_\d+/g, '');
                    return cleaned;
                };

                const cleanOldHtml = cleanTokens(oldHtml);
                const cleanNewHtml = cleanTokens(newHtml);

                // Utiliser diff-match-patch directement sur le texte nettoyé
                const dmp = new DiffMatchPatch();
                const diffs = dmp.diff_main(cleanOldHtml, cleanNewHtml);
                dmp.diff_cleanupSemantic(diffs);

                let diffHtml = '';
                for (const [op, text] of diffs) {
                    if (op === -1) {
                        diffHtml += `<span style="background-color: rgba(255, 204, 204, 0.5); text-decoration: line-through; border-bottom: 1px solid #f44336; padding: 0 2px;">${text}</span>`;
                    } else if (op === 1) {
                        diffHtml += `<span style="background-color: rgba(204, 255, 204, 0.5); border-bottom: 1px solid #4caf50; padding: 0 2px;">${text}</span>`;
                    } else {
                        diffHtml += text;
                    }
                }

                // Nettoyer les tokens résiduels avec toutes les regex possibles
                const tokenPatterns = [
                    /__HTMLTAG_\d+__/g,
                    /__DATAATTR_\d+__/g,
                    /_TOKEN_\d+_/g,
                    /TOKEN_\d+/g,
                    /__TOKEN_\d+__/g,
                    /[_]+HTMLTAG[_]+\d+[_]+/g,
                    /HTMLTAG_\d+/g,
                    /[_]+HTMLTAG[_]+\d+/g,
                    /[_]HTMLTAG[_]\d+/g,
                    /HTMLTAG[_]\d+[_]/g,
                    /HTMLTAG[_]\d+/g,
                    /[_]+TOKEN[_]+\d+[_]+/g,
                    /[_]TOKEN[_]\d+[_]/g,
                    /TOKEN[_]\d+[_]/g,
                    /[_]TOKEN[_]\d+/g,
                    /TOKEN[_]\d+/g
                ];

                // Appliquer toutes les regex de nettoyage
                for (const pattern of tokenPatterns) {
                    diffHtml = diffHtml.replace(pattern, '');
                }

                return diffHtml;
            } catch (e) {
                console.error("Erreur lors de la seconde tentative:", e);

                // En dernier recours, retourner le nouveau HTML nettoyé de tous les tokens
                let cleanedHtml = newHtml;
                const tokenPatterns = [
                    /__HTMLTAG_\d+__/g,
                    /__DATAATTR_\d+__/g,
                    /_TOKEN_\d+_/g,
                    /TOKEN_\d+/g,
                    /__TOKEN_\d+__/g,
                    /[_]+HTMLTAG[_]+\d+[_]+/g,
                    /HTMLTAG_\d+/g,
                    /[_]+HTMLTAG[_]+\d+/g,
                    /[_]HTMLTAG[_]\d+/g,
                    /HTMLTAG[_]\d+[_]/g,
                    /HTMLTAG[_]\d+/g,
                    /[_]+TOKEN[_]+\d+[_]+/g,
                    /[_]TOKEN[_]\d+[_]/g,
                    /TOKEN[_]\d+[_]/g,
                    /[_]TOKEN[_]\d+/g,
                    /TOKEN[_]\d+/g
                ];

                // Appliquer toutes les regex de nettoyage
                for (const pattern of tokenPatterns) {
                    cleanedHtml = cleanedHtml.replace(pattern, '');
                }

                return cleanedHtml;
            }
        }
    };

    // Fonction pour approuver les modifications
    const handleApprove = () => {
        if (onApprove) {
            onApprove(feedback);
            setFeedback('');
            setShowFeedbackForm(false);
        }
    };

    // Fonction pour rejeter les modifications
    const handleReject = () => {
        if (onReject) {
            onReject(feedback);
            setFeedback('');
            setShowFeedbackForm(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col md:flex-row">
                {/* Contenu principal */}
                <div className="flex-grow">
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">{description}</h3>
                        </div>

                        <div className="border rounded-lg p-4 bg-white">
                            <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
                        </div>
                    </div>
                </div>

                {/* Sidebar pour les enrichissements - uniquement si showControls est true */}
                {showControls && (
                    <div className="enrichment-sidebar w-80 ml-4 border-l pl-4">
                        <div className="sticky top-4">
                            <h3 className="text-lg font-semibold mb-3">Enrichissement</h3>

                            <div className="enrichment-item bg-white rounded-lg border border-gray-200 p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-700">Enrichissement</span>
                                </div>

                                <div className="text-sm text-gray-700 mb-3">
                                    {description}
                                </div>

                                {!readOnly && (
                                    <div>
                                        {!showFeedbackForm ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setShowFeedbackForm(true)}
                                                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex-grow"
                                                >
                                                    Voter
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="feedback-form">
                                                <textarea
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    placeholder="Votre feedback sur cet enrichissement..."
                                                    className="w-full p-2 text-sm border rounded mb-2"
                                                    rows={3}
                                                />
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={handleApprove}
                                                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 flex-grow"
                                                    >
                                                        Approuver
                                                    </button>
                                                    <button
                                                        onClick={handleReject}
                                                        className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 flex-grow"
                                                    >
                                                        Rejeter
                                                    </button>
                                                    <button
                                                        onClick={() => setShowFeedbackForm(false)}
                                                        className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Légende des modifications */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="text-sm font-medium mb-2">Légende</h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center">
                                        <span className="inline-block w-3 h-3 bg-[rgba(204,255,204,0.5)] border-b border-green-500 mr-2"></span>
                                        <span>Texte ajouté <span style={{ backgroundColor: 'rgba(204,255,204,0.5)', borderBottom: '1px solid #4caf50', padding: '0 2px' }}>exemple</span></span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="inline-block w-3 h-3 bg-[rgba(255,204,204,0.5)] border-b border-red-500 mr-2"></span>
                                        <span>Texte supprimé <span style={{ backgroundColor: 'rgba(255,204,204,0.5)', borderBottom: '1px solid #f44336', padding: '0 2px', textDecoration: 'line-through' }}>exemple</span></span>
                                    </div>
                                    <div className="flex items-center">
                                        <span style={{ display: 'inline-block', backgroundColor: 'rgba(204,255,204,0.8)', border: '1px solid #4caf50', borderRadius: '3px', padding: '0 3px', margin: '0 2px', fontSize: '0.8em', verticalAlign: 'middle' }}>↵</span>
                                        <span>Saut de ligne ajouté </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span style={{ display: 'inline-block', backgroundColor: 'rgba(255,204,204,0.8)', border: '1px solid #f44336', borderRadius: '3px', padding: '0 3px', margin: '0 2px', fontSize: '0.8em', verticalAlign: 'middle' }}>↵</span>
                                        <span>Saut de ligne supprimé </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 