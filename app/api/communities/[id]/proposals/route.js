import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  const { id } = await params;
  const communityId = parseInt(id);
  const session = await getServerSession(authOptions);

  try {
    const proposalsVoted = await prisma.community_proposal_votes.findMany({
      where: {
        voter_id: parseInt(session.user.id),
      },
      select: {
        proposal_id: true,
      },
    });

    // Récupérer toutes les propositions de cette communauté
    const proposals = await prisma.community_proposals.findMany({
      where: {
        community_id: communityId,
        status: "PENDING",
        NOT: [
          {
            id: {
              in: proposalsVoted.map((proposal) => proposal.proposal_id),
            },
          },
          {
            author_id: parseInt(session.user.id),
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        community_proposal_votes: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Formater les données pour qu'elles correspondent au format attendu par le frontend
    const formattedProposals = proposals.map((proposal) => ({
      id: proposal.id.toString(),
      title: proposal.title,
      description: proposal.description,
      status: proposal.status.toLowerCase(),
      createdBy: {
        name: proposal.user.fullName,
        profilePicture: proposal.user.profilePicture,
      },
      createdAt: proposal.created_at,
      votes: {
        approve: proposal.community_proposal_votes.filter(
          (vote) => vote.vote === "APPROVED"
        ).length,
        reject: proposal.community_proposal_votes.filter(
          (vote) => vote.vote === "REJECTED"
        ).length,
      },
    }));

    return NextResponse.json(formattedProposals);
  } catch (error) {
    console.error("Erreur lors de la récupération des propositions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des propositions" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  const { id } = await params;
  const communityId = parseInt(id);

  // Récupérer la session pour obtenir l'ID de l'utilisateur
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour soumettre une proposition" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { title, description, wantToContribute } = data;

    console.log("wantToContribute", wantToContribute);

    // Vérifier que les champs requis sont présents
    if (!title || !description) {
      return NextResponse.json(
        { error: "Le titre et la description sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est bien membre de la communauté
    const isMember = await prisma.community_learners.findUnique({
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

    if (!isMember && !isCreator) {
      return NextResponse.json(
        {
          error:
            "Vous devez être membre de la communauté pour soumettre une proposition",
        },
        { status: 403 }
      );
    }

    // Créer la nouvelle proposition
    const newProposal = await prisma.community_proposals.create({
      data: {
        community_id: communityId,
        author_id: parseInt(session.user.id),
        title,
        description,
        status: "PENDING",
        possible_contributors: wantToContribute ? session.user.id : null,
      },
      include: {
        user: {
          select: {
            fullName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Formater la réponse
    const formattedProposal = {
      id: newProposal.id.toString(),
      title: newProposal.title,
      description: newProposal.description,
      status: "pending",
      createdBy: {
        name: newProposal.user.fullName,
        profilePicture: newProposal.user.profilePicture,
      },
      createdAt: newProposal.created_at,
      votes: {
        approve: 0,
        reject: 0,
      },
    };

    return NextResponse.json(formattedProposal);
  } catch (error) {
    console.error("Erreur lors de la soumission de la proposition:", error);
    return NextResponse.json(
      { error: "Erreur lors de la soumission de la proposition" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
