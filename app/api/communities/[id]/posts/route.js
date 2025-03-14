import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { title, content, coverImageUrl, tag, acceptContributions } =
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
        cover_image_url: coverImageUrl,
        tag,
        community_id: communityId,
        author_id: userId,
        accept_contributions: acceptContributions,
        status: "PUBLISHED",
      },
    });

    const author = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
      },
    });

    // Créer des notifications pour tous les membres de la communauté

    const learners = await prisma.community_learners.findMany({
      where: {
        community_id: communityId,
      },
    });

    console.log("learners", learners);

    const contributors = await prisma.community_contributors.findMany({
      where: {
        community_id: communityId,
      },
    });

    const membersId = [...learners.map((learner) => learner.learner_id), ...contributors.map((contributor) => contributor.contributor_id)];

    //Filter pour ne pas avoir de doublons
    const membersIdFiltered = membersId.filter((id, index, self) => self.indexOf(id) === index);

    console.log("membersId", membersIdFiltered);


    if (membersId.length === 0) return; // Pas de membres à notifier


    // Créer des notifications pour tous les membres en une seule opération
    await createBulkNotifications({
      userIds: membersIdFiltered,
      title: `Nouveau post !`,
      message: `Un nouveau post à été publié dans ${community.name}`,
      type: NotificationType.NEW_POST,
      link: `/community/${communityId}/posts/${post.id}`,
      metadata: {
        communityId,
        postId: post.id,
        creatorId: post.author_id,
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
        status: "PUBLISHED",
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

    // Ajouter des en-têtes de cache
    const headers = new Headers();
    headers.append("Cache-Control", "max-age=300, s-maxage=300");

    return NextResponse.json(
      { posts: posts || [] },
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.log("Erreur lors de la récupération des posts:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des posts", posts: [] },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
