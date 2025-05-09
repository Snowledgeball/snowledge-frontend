import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    console.log("session détaillée:", JSON.stringify(session, null, 2));
    console.log("Headers de requête:", req.headers);

    if (!session) {
      console.log("Session non trouvée - retour 401");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const communityId = parseInt(params.id);

    // Récupérer tous les contributeurs de la communauté
    const contributors = await prisma.community_contributors.findMany({
      where: {
        community_id: communityId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            userName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Formater les données pour le frontend
    const formattedContributors = contributors.map((contributor) => {
      return {
        id: contributor.user.id,
        fullName: contributor.user.fullName,
        userName: contributor.user.userName,
        profilePicture: contributor.user.profilePicture,
        joinedAt: contributor.added_at,
      };
    });

    return NextResponse.json(formattedContributors);
  } catch (error) {
    console.error("Erreur lors de la récupération des contributeurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contributeurs" },
      { status: 500 }
    );
  }
}
