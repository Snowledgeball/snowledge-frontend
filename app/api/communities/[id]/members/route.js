import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const communityId = parseInt(id);

    // Récupérer les contributeurs
    const contributors = await prisma.community_contributors.findMany({
      where: {
        community_id: communityId,
      },
      include: {
        community: true,
      },
    });

    console.log("contributors", contributors);

    // Récupérer les apprenants
    const learners = await prisma.community_learners.findMany({
      where: {
        community_id: communityId,
      },
      include: {
        community: true,
      },
    });

    // Récupérer les informations des utilisateurs
    const contributorIds = contributors.map((c) => c.contributor_id);
    const learnerIds = learners.map((l) => l.learner_id);
    const allUserIds = [...new Set([...contributorIds, ...learnerIds])];

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: allUserIds,
        },
      },
      select: {
        id: true,
        fullName: true,
        userName: true,
        profilePicture: true,
      },
    });

    // Construire la réponse
    const members = users.map((user) => {
      const isContributor = contributorIds.includes(user.id);
      // On cherche toujours dans les learners pour avoir la date de join
      const learnerData = learners.find((l) => l.learner_id === user.id);
      const contributorData = isContributor
        ? contributors.find((c) => c.contributor_id === user.id)
        : null;

      return {
        id: user.id,
        fullName: user.fullName,
        userName: user.userName,
        profilePicture: user.profilePicture,
        status: isContributor ? "Contributeur" : "Apprenant",
        // On utilise la date de join des learners en priorité
        joinedAt: learnerData?.joined_at,
        revisions: contributorData?.revisions_count || 0,
        posts: contributorData?.posts_count || 0,
        gains: contributorData?.earnings || 0,
      };
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des membres" },
      { status: 500 }
    );
  }
}
