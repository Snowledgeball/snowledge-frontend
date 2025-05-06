import { Contribution } from "./types";

/**
 * Tronque et sécurise un texte HTML
 * @param text Texte HTML à traiter
 * @param maxLength Longueur maximale
 * @returns Texte tronqué et sécurisé
 */
export const truncateAndSanitize = (
  text: string,
  maxLength: number
): string => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = text.replace(/<\/?[^>]+(>|$)/g, "");
  const cleanText = tempDiv.textContent || tempDiv.innerText || "";

  return cleanText.length > maxLength
    ? cleanText.substring(0, maxLength) + "..."
    : cleanText;
};

/**
 * Trie les contributions par date (plus récent en premier)
 * @param contributions Liste des contributions
 * @returns Liste triée
 */
export const sortContributionsByDate = (
  contributions: Contribution[]
): Contribution[] => {
  return [...contributions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

/**
 * Combine les créations et enrichissements en une seule liste
 * @param creations Liste des créations
 * @param enrichments Liste des enrichissements
 * @returns Liste combinée
 */
export const combineContributions = (
  creations: any[],
  enrichments: any[]
): Contribution[] => {
  // Formater les créations
  const formattedCreations: Contribution[] = creations.map((creation: any) => ({
    id: creation.id,
    title: creation.title,
    content: creation.content,
    status: creation.status,
    tag: "creation",
    created_at: creation.created_at,
    user: creation.user,
    community_posts_reviews: creation.community_posts_reviews,
  }));

  // Formater les enrichissements
  const formattedEnrichments: Contribution[] = enrichments.map(
    (enrichment: any) => ({
      id: enrichment.id,
      title: enrichment.title,
      content: enrichment.content,
      status: enrichment.status,
      tag: "enrichment",
      created_at: enrichment.created_at,
      original_content: enrichment.original_content,
      post_id: enrichment.post_id,
      user: enrichment.user,
    })
  );

  // Retourner la liste combinée et triée
  return sortContributionsByDate([
    ...formattedCreations,
    ...formattedEnrichments,
  ]);
};
