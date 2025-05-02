export interface DiffResult {
    html: string;
    hasChanges: boolean;
}

/**
 * Implémentation simplifiée d'un algorithme de différence pour le texte
 * Cette fonction compare deux chaînes de caractères et retourne un tableau
 * indiquant les parties communes, ajoutées et supprimées
 */
function simpleDiff(oldText: string, newText: string): Array<{ type: 'common' | 'added' | 'removed', value: string }> {
    // Si les textes sont identiques, retourner le texte comme commun
    if (oldText === newText) {
        return [{ type: 'common', value: oldText }];
    }

    // Si l'un des textes est vide, tout est soit ajouté soit supprimé
    if (oldText === '') {
        return [{ type: 'added', value: newText }];
    }
    if (newText === '') {
        return [{ type: 'removed', value: oldText }];
    }

    // Implémentation très simplifiée qui considère tout le texte comme modifié
    // Dans une implémentation réelle, on utiliserait un algorithme plus sophistiqué
    return [
        { type: 'removed', value: oldText },
        { type: 'added', value: newText }
    ];
}

/**
 * Fonction simplifiée pour générer un HTML avec les différences entre deux textes
 * Cette version utilise une approche basique pour mettre en évidence les ajouts et suppressions
 */
export function generateInlineDiff(oldHtml: string, newHtml: string): DiffResult {
    // Si les textes sont identiques, retourner le HTML original
    if (oldHtml === newHtml) {
        return { html: oldHtml, hasChanges: false };
    }

    // Extraire le texte des HTML (version côté client)
    let oldText = oldHtml;
    let newText = newHtml;

    try {
        // Cette partie ne fonctionnera que côté client
        if (typeof document !== 'undefined') {
            const tempDiv1 = document.createElement('div');
            tempDiv1.innerHTML = oldHtml;
            oldText = tempDiv1.textContent || '';

            const tempDiv2 = document.createElement('div');
            tempDiv2.innerHTML = newHtml;
            newText = tempDiv2.textContent || '';
        }
    } catch (error) {
        console.error('Erreur lors de l\'extraction du texte:', error);
    }

    // Calculer les différences
    const diffs = simpleDiff(oldText, newText);

    // Créer une version hybride qui montre les différences
    // Cette approche est simplifiée et ne montre pas les différences mot par mot
    // mais elle donne une idée des changements sans dépendances externes

    // Nous allons créer une version qui montre le nouveau contenu
    // mais avec des indications visuelles pour les sections modifiées
    const diffHtml = `
      <div class="diff-container">
        <div class="diff-content">
          ${newHtml}
        </div>
        <div class="diff-info mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
          <p class="text-sm font-medium">Ce contenu a été modifié par rapport à l'original.</p>
          <p class="text-xs mt-1">Pour voir les détails précis des modifications, utilisez les onglets "Contenu original" et "Contenu modifié".</p>
        </div>
      </div>
    `;

    return {
        html: diffHtml,
        hasChanges: true
    };
}

/**
 * Génère un HTML avec les différences entre deux HTML
 * Cette version utilise la même approche que generateInlineDiff
 */
export function generateHtmlDiff(oldHtml: string, newHtml: string): DiffResult {
    return generateInlineDiff(oldHtml, newHtml);
}

/**
 * Fonction utilitaire pour créer une version côte à côte des deux contenus
 */
export function generateSideBySideDiff(oldHtml: string, newHtml: string): string {
    return `
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h3 class="text-lg font-medium mb-2">Contenu original</h3>
          <div class="p-3 border rounded bg-gray-50">${oldHtml}</div>
        </div>
        <div>
          <h3 class="text-lg font-medium mb-2">Contenu modifié</h3>
          <div class="p-3 border rounded bg-gray-50">${newHtml}</div>
        </div>
      </div>
    `;
} 