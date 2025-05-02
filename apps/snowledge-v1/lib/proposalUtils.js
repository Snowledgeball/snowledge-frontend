import { prisma } from "@/lib/prisma";

/**
 * Vérifie l'état d'une proposition en fonction des votes reçus
 * @param {number|Array} proposalIdOrVotes - ID de la proposition ou tableau des votes
 * @param {number} contributorsCount - Le nombre total de contributeurs
 * @param {boolean} useProposalId - Si true, charge les votes depuis la base de données
 * @returns {Object} - Résultat avec shouldUpdate, newStatus et raison
 */
export async function checkProposalStatus(
  proposalIdOrVotes,
  contributorsCount,
  useProposalId = true
) {
  try {
    // Variables pour stocker les votes
    let votes;

    // Si on utilise l'ID de la proposition, charger les votes depuis la BD
    if (useProposalId && typeof proposalIdOrVotes === "number") {
      votes = await prisma.community_proposal_votes.findMany({
        where: {
          proposal_id: proposalIdOrVotes,
        },
      });
    } else {
      // Sinon, utiliser directement le tableau de votes fourni
      votes = proposalIdOrVotes;
    }

    // Comptage des votes
    const totalVotes = votes.length;
    const approvalCount = votes.filter(
      (vote) => vote.vote === "APPROVED"
    ).length;
    const rejectionCount = votes.filter(
      (vote) => vote.vote === "REJECTED"
    ).length;

    // Calcul du taux de participation
    const participationRate =
      contributorsCount === 0
        ? 0
        : Math.round((totalVotes / contributorsCount) * 100);

    // Déterminer si le nombre de contributeurs est pair
    const isEven = contributorsCount % 2 === 0;

    // Calculer le seuil requis pour une décision
    const requiredVotes = isEven
      ? contributorsCount / 2 + 1 // Majorité stricte si pair
      : Math.ceil(contributorsCount / 2); // Moitié arrondie au supérieur si impair

    // Structure de base pour le résultat
    const result = {
      shouldUpdate: false,
      newStatus: "PENDING",
      reason: "",
      details: {
        approvalCount,
        rejectionCount,
        totalVotes,
        contributorsCount,
        requiredVotes,
        participationRate,
      },
    };

    // Vérifier les conditions pour une mise à jour du statut
    if (approvalCount >= requiredVotes) {
      result.shouldUpdate = true;
      result.newStatus = "APPROVED";
      result.reason = "ENOUGH_APPROVALS";
    } else if (rejectionCount >= requiredVotes) {
      result.shouldUpdate = true;
      result.newStatus = "REJECTED";
      result.reason = "ENOUGH_REJECTIONS";
    } else if (totalVotes === contributorsCount) {
      // Si tous les contributeurs ont voté mais pas de majorité claire
      result.shouldUpdate = true;
      result.newStatus =
        approvalCount > rejectionCount ? "APPROVED" : "REJECTED";
      result.reason = "ALL_VOTED_NO_MAJORITY";
    } else {
      result.reason = "NO_MAJORITY";
    }

    console.log(result);
    return result;
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du statut de la proposition:",
      error
    );
    return {
      shouldUpdate: false,
      newStatus: "PENDING",
      reason: "ERROR",
      details: { error: error.message },
    };
  } finally {
    if (useProposalId) {
      // Fermer la connexion prisma si on l'a utilisée dans cette fonction
      await prisma.$disconnect();
    }
  }
}
