"use client";

import { useState, useEffect } from 'react';
import DiffMatchPatch from 'diff-match-patch';

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
    const [viewMode, setViewMode] = useState<'suggestions' | 'original' | 'preview'>('suggestions');
    const [processedHtml, setProcessedHtml] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);

    useEffect(() => {
        // Traiter le HTML pour afficher les différences dans le style Google Docs
        if (viewMode === 'suggestions') {
            // Version simplifiée qui montre les suggestions
            const html = createSuggestionsView(oldHtml, newHtml);
            setProcessedHtml(html);
        } else if (viewMode === 'preview') {
            // Version qui montre le résultat final
            setProcessedHtml(newHtml);
        } else {
            // Version qui montre le contenu original
            setProcessedHtml(oldHtml);
        }
    }, [oldHtml, newHtml, viewMode]);

    // Fonction pour créer une vue avec suggestions
    const createSuggestionsView = (oldHtml: string, newHtml: string): string => {
        if (oldHtml === newHtml) {
            return oldHtml;
        }

        // Styles pour les modifications
        const styledHtml = `
          <style>
            .suggestion-added {
              background-color: rgba(255, 255, 153, 0.5);
              text-decoration: none;
              color: #000;
              position: relative;
              border-bottom: 1px solid #ffd700;
            }
            .suggestion-removed {
              background-color: rgba(255, 204, 204, 0.5);
              text-decoration: line-through;
              color: #b71c1c;
              position: relative;
              border-bottom: 1px solid #f44336;
            }
            .suggestion-highlight {
              background-color: rgba(255, 235, 59, 0.3);
              border-bottom: 1px solid #fbc02d;
            }
            
            /* Style pour les paragraphes ajoutés */
            .paragraph-added {
              background-color: rgba(204, 255, 204, 0.5);
              border-left: 4px solid #4caf50;
              padding: 8px;
              margin: 8px 0;
            }
          </style>
          
          <div class="relative pl-2">
            ${findRealDifferences(oldHtml, newHtml)}
          </div>
        `;

        return styledHtml;
    };

    // Fonction pour trouver les différences réelles entre deux textes HTML
    const findRealDifferences = (oldHtml: string, newHtml: string): string => {
        // Nettoyer le HTML pour obtenir le texte brut
        const cleanHtml = (html: string) => {
            // Remplacer les balises <p> et </p> par des marqueurs de paragraphe
            let text = html.replace(/<p[^>]*>/gi, '\n\n').replace(/<\/p>/gi, '');

            // Supprimer toutes les autres balises HTML
            text = text.replace(/<[^>]*>/g, '');

            // Décoder les entités HTML
            text = text.replace(/&nbsp;/g, ' ')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');

            // Normaliser les espaces mais conserver les sauts de ligne
            text = text.replace(/[ \t]+/g, ' ');

            return text;
        };

        // Fonction pour convertir le HTML en paragraphes
        const splitIntoParagraphs = (html: string): string[] => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const paragraphs: string[] = [];
            const pElements = tempDiv.querySelectorAll('p');

            if (pElements.length === 0) {
                // Pas de paragraphes, traiter tout le contenu comme un seul paragraphe
                paragraphs.push(cleanHtml(html));
            } else {
                // Extraire le texte de chaque paragraphe
                pElements.forEach(p => {
                    paragraphs.push(cleanHtml(p.outerHTML));
                });
            }

            return paragraphs;
        };

        const oldParagraphs = splitIntoParagraphs(oldHtml);
        const newParagraphs = splitIntoParagraphs(newHtml);

        // Si les deux textes sont identiques, retourner le HTML original
        if (oldHtml === newHtml) {
            return oldHtml;
        }

        // Utiliser l'algorithme diff-match-patch pour chaque paragraphe
        const dmp = new DiffMatchPatch();
        let resultHtml = '';

        // Traiter chaque paragraphe
        const maxParagraphs = Math.max(oldParagraphs.length, newParagraphs.length);

        for (let i = 0; i < maxParagraphs; i++) {
            const oldPara = i < oldParagraphs.length ? oldParagraphs[i] : '';
            const newPara = i < newParagraphs.length ? newParagraphs[i] : '';

            if (oldPara === '' && newPara !== '') {
                // Paragraphe entièrement ajouté
                resultHtml += `<p class="paragraph-added">${newPara}</p>`;
                continue;
            }

            if (oldPara !== '' && newPara === '') {
                // Paragraphe entièrement supprimé
                resultHtml += `<p><span class="suggestion-removed">${oldPara}</span></p>`;
                continue;
            }

            if (oldPara === newPara) {
                // Paragraphe inchangé
                resultHtml += `<p>${oldPara}</p>`;
                continue;
            }

            // Paragraphe modifié - trouver les différences
            const diffs = dmp.diff_main(oldPara, newPara);
            dmp.diff_cleanupSemantic(diffs);

            let paraHtml = '<p>';

            for (const [operation, text] of diffs) {
                if (text.trim() === '') {
                    paraHtml += text; // Préserver les espaces
                    continue;
                }

                // Opération: -1 pour suppression, 0 pour égal, 1 pour ajout
                if (operation === -1) {
                    // Texte supprimé
                    paraHtml += `<span class="suggestion-removed">${text}</span>`;
                } else if (operation === 1) {
                    // Texte ajouté
                    paraHtml += `<span class="suggestion-added">${text}</span>`;
                } else {
                    // Texte inchangé
                    paraHtml += text;
                }
            }

            paraHtml += '</p>';
            resultHtml += paraHtml;
        }

        return resultHtml;
    };

    // Fonction simplifiée pour compter les différences
    const countDifferences = (oldHtml: string, newHtml: string): number => {
        // Dans une implémentation réelle, on compterait les différences réelles
        // Pour l'instant, on retourne simplement 1 s'il y a une différence
        return oldHtml !== newHtml ? 1 : 0;
    };

    const handleApprove = () => {
        if (onApprove) {
            onApprove(feedback);
            setFeedback('');
            setShowFeedbackForm(false);
        }
    };

    const handleReject = () => {
        if (onReject) {
            onReject(feedback);
            setFeedback('');
            setShowFeedbackForm(false);
        }
    };

    return (
        <div className="google-docs-diff flex">
            <div className="content-area flex-grow">
                {showControls && (
                    <div className="flex space-x-2 mb-4 border-b">
                        <button
                            className={`px-4 py-2 ${viewMode === 'suggestions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setViewMode('suggestions')}
                        >
                            Mode suggestions
                        </button>
                        <button
                            className={`px-4 py-2 ${viewMode === 'preview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setViewMode('preview')}
                        >
                            Aperçu
                        </button>
                        <button
                            className={`px-4 py-2 ${viewMode === 'original' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                            onClick={() => setViewMode('original')}
                        >
                            Original
                        </button>
                    </div>
                )}

                <div className="border rounded-lg p-4">
                    <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
                </div>
            </div>

            {/* Sidebar pour les enrichissements */}
            <div className="enrichment-sidebar w-80 ml-4 border-l pl-4">
                <div className="sticky top-4">
                    <h3 className="text-lg font-semibold mb-3">Enrichissement</h3>

                    <div className="enrichment-item bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700">Enrichissement</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">En attente</span>
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
                                            Laisser un feedback
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
                                <span>Texte ajouté</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-[rgba(255,204,204,0.5)] border-b border-red-500 mr-2 line-through"></span>
                                <span>Texte supprimé</span>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-block w-3 h-3 bg-[rgba(255,255,153,0.5)] border-b border-yellow-500 mr-2"></span>
                                <span>Texte mis en évidence</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 