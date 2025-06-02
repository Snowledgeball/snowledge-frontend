import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkProposalStatus } from "@/lib/proposalUtils";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

export async function POST(request, { params }) {
  const { id, proposalId } = await params;
  const communityId = parseInt(id);
  const proposalIdInt = parseInt(proposalId);

  // Vérifier la session utilisateur
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour voter" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { vote, wantToContribute } = data; // "APPROVED" ou "REJECTED"

    if (vote !== "APPROVED" && vote !== "REJECTED") {
      return NextResponse.json(
        { error: "Vote invalide. Valeurs acceptées: APPROVED, REJECTED" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est contributeur de la communauté
    const isLearner = await prisma.community_learners.findUnique({
      where: {
        community_id_learner_id: {
          community_id: communityId,
          learner_id: parseInt(session.user.id),
        },
      },
    });

    const isCreator = await prisma.community.findUnique({
      where: {
        id: communityId,
        creator_id: parseInt(session.user.id),
      },
      select: {
        id: true,
      },
    });

    if (!isLearner && !isCreator) {
      return NextResponse.json(
        { error: "Seuls les membres peuvent voter sur les propositions" },
        { status: 403 }
      );
    }

    // Vérifier que la proposition existe et appartient à la communauté
    const proposal = await prisma.community_proposals.findFirst({
      where: {
        id: proposalIdInt,
        community_id: communityId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
        community: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposition introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur n'a pas déjà voté
    const existingVote = await prisma.community_proposal_votes.findUnique({
      where: {
        proposal_id_voter_id: {
          proposal_id: proposalIdInt,
          voter_id: parseInt(session.user.id),
        },
      },
    });

    if (existingVote) {
      // Mettre à jour le vote existant
      await prisma.community_proposal_votes.update({
        where: {
          id: existingVote.id,
        },
        data: {
          vote,
        },
      });
    } else {
      // Proposer un nouveau sujet
      await prisma.community_proposal_votes.create({
        data: {
          proposal_id: proposalIdInt,
          voter_id: parseInt(session.user.id),
          vote,
        },
      });
    }

    if (wantToContribute) {
      // Liste actuelle des contributeurs potentiels
      let currentContributors = proposal.possible_contributors
        ? proposal.possible_contributors.split(",").map((id) => parseInt(id))
        : [];

      // Vérifier si l'utilisateur est déjà dans la liste
      if (currentContributors.includes(session.user.id)) {
        return NextResponse.json(
          { error: "Vous êtes déjà inscrit comme contributeur potentiel" },
          { status: 400 }
        );
      }

      // Ajouter l'utilisateur à la liste des contributeurs potentiels
      currentContributors.push(session.user.id);

      // Mettre à jour la proposition
      await prisma.community_proposals.update({
        where: {
          id: proposalIdInt,
        },
        data: {
          possible_contributors: currentContributors.join(","),
        },
      });
    }

    // Récupérer le nombre total de contributeurs
    const learners = await prisma.community_learners.findMany({
      where: {
        community_id: communityId,
      },
    });

    // Récupérer tous les votes pour cette proposition
    const allVotes = await prisma.community_proposal_votes.findMany({
      where: {
        proposal_id: proposalIdInt,
      },
    });

    // Vérifier le statut de la proposition
    const { shouldUpdate, newStatus } = checkProposalStatus(
      allVotes,
      learners.length,
      false
    );

    // Si le statut doit être mis à jour
    if (shouldUpdate) {
      // Mettre à jour le statut de la proposition
      await prisma.community_proposals.update({
        where: {
          id: proposalIdInt,
        },
        data: {
          status: newStatus,
        },
      });

      // Envoyer une notification à l'auteur de la proposition
      await createBulkNotifications({
        userIds: learners.map((learner) => learner.learner_id),
        title:
          newStatus === "APPROVED"
            ? "Votre proposition a été approuvée"
            : "Votre proposition a été rejetée",
        message:
          newStatus === "APPROVED"
            ? `Votre proposition "${proposal.title}" a été approuvée par la communauté "${proposal.community.name}"`
            : `Votre proposition "${proposal.title}" a été rejetée par la communauté "${proposal.community.name}"`,
        type:
          newStatus === "APPROVED"
            ? NotificationType.PROPOSAL_APPROVED
            : NotificationType.PROPOSAL_REJECTED,
        link: `/community/${communityId}`,
        metadata: {
          communityId,
          proposalId: proposalIdInt,
          proposalStatus: newStatus,
        },
      });
    } else {
      await createBulkNotifications({
        userIds: [proposal.author_id],
        title: `Vous avez reçu un vote ${vote === "APPROVED" ? "positif !" : "négatif"}`,
        message: `Votre proposition "${proposal.title}" a reçu un vote ${vote === "APPROVED" ? "positif" : "négatif"} dans la communauté ${proposal.community.name}`,
        type:
          vote === "APPROVED"
            ? NotificationType.VOTE_APPROVED
            : NotificationType.VOTE_REJECTED,
        link: `/community/${communityId}?tab=voting`,
        metadata: {
          communityId,
          proposalId: proposalIdInt,
        },
      });
    }

    // Formater la réponse
    return NextResponse.json({
      success: true,
      proposal: {
        id: proposalIdInt,
        status: shouldUpdate
          ? newStatus.toLowerCase()
          : proposal.status.toLowerCase(),
        votes: {
          approve: allVotes.filter((v) => v.vote === "APPROVED").length,
          reject: allVotes.filter((v) => v.vote === "REJECTED").length,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors du vote:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du vote" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
