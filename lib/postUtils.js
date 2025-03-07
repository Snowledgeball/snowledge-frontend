/**
 * Vérifie si un post peut être publié en fonction des votes reçus
 * @param {Object} post - Le post à vérifier
 * @param {number} contributorsCount - Le nombre total de contributeurs
 * @param {boolean} isContributorsCountEven - Si le nombre de contributeurs est pair
 * @returns {Object} - Résultat avec canPublish et les détails
 */
export const checkPostPublishability = (post, contributorsCount, isContributorsCountEven) => {
    // Calculer le taux de participation
    const totalReviews = post.community_posts_reviews.length;
    const participationRate = contributorsCount === 0 ? 0 : Math.round((totalReviews / contributorsCount) * 100);

    // Compter les votes positifs
    const approvedCount = post.community_posts_reviews.filter(r => r.status === "APPROVED").length;

    // Si pas assez de participation, on ne peut pas publier
    if (participationRate < 50) {
        return {
            canPublish: false,
            reason: "PARTICIPATION_TOO_LOW",
            details: {
                participationRate,
                currentVotes: totalReviews,
                requiredVotes: Math.ceil(contributorsCount / 2)
            }
        };
    }

    // Calculer le nombre de votes nécessaires pour une majorité stricte
    const requiredApprovals = isContributorsCountEven
        ? (contributorsCount / 2) + 1
        : Math.ceil(contributorsCount / 2);

    // Vérifier si le post a suffisamment de votes positifs
    const canPublish = approvedCount >= requiredApprovals;

    return {
        canPublish,
        reason: canPublish ? "APPROVED" : "NOT_ENOUGH_APPROVALS",
        details: {
            approvedCount,
            requiredApprovals,
            participationRate
        }
    };
}; 