import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseConfig";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const communityId = parseInt(params.id);

    // Récupérer tous les learners de la communauté
    const learners = await db.community_learner.findMany({
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
    const formattedLearners = learners.map((learner) => {
      return {
        id: learner.user.id,
        fullName: learner.user.fullName,
        userName: learner.user.userName,
        profilePicture: learner.user.profilePicture,
        joinedAt: learner.joined_at,
        role: "learner",
      };
    });

    return NextResponse.json(formattedLearners);
  } catch (error) {
    console.error("Erreur lors de la récupération des learners:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des learners" },
      { status: 500 }
    );
  }
}
