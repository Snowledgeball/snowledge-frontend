import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    console.log("Requet bien TRAVERSEEEEEEE");
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: communityId, postId } = await params;

    // Vérifier que l'utilisateur est contributeur ou créateur
    const isContributor = await prisma.community_contributors.findUnique({
      where: {
        community_id_contributor_id: {
          community_id: parseInt(communityId),
          contributor_id: parseInt(session.user.id),
        },
      },
    });

    const community = await prisma.community.findUnique({
      where: { id: parseInt(communityId) },
    });

    if (!isContributor && community.creator_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupérer le post avec ses reviews
    const post = await prisma.community_posts.findFirst({
      where: {
        id: parseInt(postId),
        community_id: parseInt(communityId),
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        community_posts_reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.log("Erreur:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du post" },
      { status: 500 }
    );
  }
}
