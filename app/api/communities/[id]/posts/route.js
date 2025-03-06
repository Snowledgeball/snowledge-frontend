import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { title, content, cover_image_url, tag, accept_contributions } =
      await request.json();
    const { id } = await params;
    const communityId = parseInt(id);
    const userId = parseInt(session.user.id);

    // Vérifier que l'utilisateur est bien le créateur ou un contributeur
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        community_contributors: true,
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Communauté non trouvée" },
        { status: 404 }
      );
    }

    const isCreator = community.creator_id === userId;
    const isContributor = community.community_contributors.some(
      (contributor) => contributor.contributor_id === userId
    );

    if (!isCreator && !isContributor) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour publier" },
        { status: 403 }
      );
    }

    // Créer le post
    const post = await prisma.community_posts.create({
      data: {
        title,
        content,
        cover_image_url,
        tag,
        community_id: communityId,
        author_id: userId,
        accept_contributions,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("Erreur lors de la création du post:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la création du post" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const communityId = parseInt(id);

    const posts = await prisma.community_posts.findMany({
      where: {
        community_id: communityId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.log("Erreur lors de la récupération des posts:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des posts" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
