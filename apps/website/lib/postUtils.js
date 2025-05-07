/**
 * Vérifie l'état de publication d'un post en fonction des votes reçus
 * @param {Object} post - Le post à vérifier
 * @param {number} contributorsCount - Le nombre total de contributeurs
 * @param {boolean} isContributorsCountEven - Si le nombre de contributeurs est pair
 * @returns {Object} - Résultat avec status et les détails
 */
export const checkPostStatus = (post, contributorsCount, isContributorsCountEven) => {
    // Calculer le taux de participation
    const totalReviews = post.community_posts_reviews.length;
    const participationRate = contributorsCount === 0 ? 0 : Math.round((totalReviews / contributorsCount) * 100);

    // Compter les votes positifs et négatifs
    const approvedCount = post.community_posts_reviews.filter(r => r.status === "APPROVED").length;
    const rejectedCount = post.community_posts_reviews.filter(r => r.status === "REJECTED").length;

    // Si pas assez de participation, on ne peut pas prendre de décision
    if (participationRate < 50) {
        return {
            status: "PENDING",
            reason: "PARTICIPATION_TOO_LOW",
            details: {
                participationRate,
                currentVotes: totalReviews,
                requiredVotes: Math.ceil(contributorsCount / 2),
                approvedCount,
                rejectedCount
            }
        };
    }

    // Calculer le nombre de votes nécessaires pour une majorité stricte
    const requiredMajority = isContributorsCountEven
        ? (contributorsCount / 2) + 1
        : Math.ceil(contributorsCount / 2);

    // Vérifier si le post a suffisamment de votes positifs pour être approuvé
    if (approvedCount >= requiredMajority) {
        return {
            status: "APPROVED",
            reason: "ENOUGH_APPROVALS",
            details: {
                approvedCount,
                rejectedCount,
                requiredMajority,
                participationRate
            }
        };
    }

    // Vérifier si le post a suffisamment de votes négatifs pour être rejeté
    if (rejectedCount >= requiredMajority) {
        return {
            status: "REJECTED",
            reason: "ENOUGH_REJECTIONS",
            details: {
                approvedCount,
                rejectedCount,
                requiredMajority,
                participationRate
            }
        };
    }

    // Sinon, le post reste en attente
    return {
        status: "PENDING",
        reason: "NO_MAJORITY",
        details: {
            approvedCount,
            rejectedCount,
            requiredMajority,
            participationRate
        }
    };
}; 