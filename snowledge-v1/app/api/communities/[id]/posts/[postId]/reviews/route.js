import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";
import { checkContributionStatus } from "@/lib/contributionUtils";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: communityId, postId } = await params;
    const { content, status } = await request.json();

    // Vérifier que l'utilisateur est contributeur
    const membership = await prisma.community_contributors.findUnique({
      where: {
        community_id_contributor_id: {
          community_id: parseInt(communityId),
          contributor_id: parseInt(session.user.id),
        },
      },
    });

    const isCreator = await prisma.community.findUnique({
      where: {
        id: parseInt(communityId),
        creator_id: parseInt(session.user.id),
      },
    });

    if (!membership && !isCreator) {
      return NextResponse.json(
        { error: "Vous n'êtes pas contributeur de cette communauté" },
        { status: 403 }
      );
    }

    // Vérifier que le post existe et est en attente
    const post = await prisma.community_posts.findUnique({
      where: {
        id: parseInt(postId),
        community_id: parseInt(communityId),
      },
      include: {
        user: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
    const community = await prisma.community.findUnique({
      where: {
        id: parseInt(communityId),
      },
      include: {
        community_contributors: true,
      },
    });

    const isContributor = community.community_contributors.some(
      (contributor) => contributor.contributor_id === parseInt(session.user.id)
    );

    // Permettre le vote si l'utilisateur est contributeur OU créateur de la communauté
    if (!isContributor && !isCreator) {
      return NextResponse.json(
        { error: "Vous devez être un contributeur pour voter" },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur est l'auteur du post
    if (post.author_id === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas réviser votre propre post" },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur a déjà soumis une révision
    const existingReview = await prisma.community_posts_reviews.findFirst({
      where: {
        post_id: parseInt(postId),
        reviewer_id: parseInt(session.user.id),
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Vous avez déjà soumis une révision pour ce post" },
        { status: 400 }
      );
    }

    // Créer la révision
    const review = await prisma.community_posts_reviews.create({
      data: {
        post_id: parseInt(postId),
        reviewer_id: parseInt(session.user.id),
        content,
        status,
      },
    });

    // Récupérer les informations du contributeur qui a voté
    const contributor = await prisma.user.findUnique({
      where: {
        id: parseInt(session.user.id),
      },
    });

    // Récupérer le post avec toutes ses reviews
    const updatedPost = await prisma.community_posts.findUnique({
      where: {
        id: parseInt(postId),
      },
      include: {
        community_posts_reviews: true,
        user: true,
        community: true,
      },
    });

    // Récupérer le nombre de contributeurs
    const contributorsCount = await prisma.community_contributors.count({
      where: {
        community_id: parseInt(communityId),
      },
    });

    // Vérifier le statut du post
    const { shouldUpdate, newStatus } = checkContributionStatus(
      updatedPost.community_posts_reviews,
      contributorsCount
    );

    // Mettre à jour le statut de la contribution si nécessaire
    if (shouldUpdate) {
      // Si le post est approuvé, envoyer une notification à l'auteur
      if (newStatus === "APPROVED") {
        // Mettre à jour le statut du post en "PUBLISHED"
        await prisma.community_posts.update({
          where: {
            id: parseInt(postId),
          },
          data: { status: "PUBLISHED" },
        });

        try {
          await createBulkNotifications({
            userIds: [updatedPost.author_id],
            title: "Votre post a été publié !",
            message: `Votre post "${updatedPost.title}" a été approuvé par la majorité des contributeurs. Il a été publié automatiquement.`,
            type: NotificationType.POST_READY_PUBLISH,
            link: `/community/${communityId}`,
            metadata: {
              communityId,
              postId,
              postStatus: newStatus,
            },
          });
        } catch (notifError) {
          console.error(
            "Erreur lors de l'envoi de la notification de publication:",
            notifError
          );
        }

        const communityUsers = await prisma.community_learners.findMany({
          where: {
            community_id: parseInt(communityId),
          },
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        });

        console.log("communityUsers", communityUsers);
        const userIds = communityUsers.map((user) => user.user.id);
        // Notifier toute la communauté que le post est publié
        await createBulkNotifications({
          userIds: userIds,
          title: "Un nouveau post est publié !",
          message: `Le post "${updatedPost.title}" a été publié dans la communauté "${updatedPost.community.name} grâce aux votes".`,
          type: NotificationType.NEW_POST,
          link: `/community/${communityId}/posts/${postId}`,
          metadata: {
            communityId,
            postId,
          },
        });
      }

      // Si le post est rejeté, le déplacer en brouillon et notifier l'auteur
      if (newStatus === "REJECTED") {
        // Mettre à jour le statut du post en "DRAFT"
        await prisma.community_posts.update({
          where: {
            id: parseInt(postId),
          },
          data: {
            status: "DRAFT",
          },
        });

        // Notifier l'auteur avec un lien direct vers l'édition du brouillon
        try {
          await createBulkNotifications({
            userIds: [updatedPost.author_id],
            title: "Votre post a été rejeté par la communauté",
            message: `Votre post "${updatedPost.title}" dans la communauté "${updatedPost.community.name}" a été rejeté par la majorité des contributeurs. Consultez les feedbacks pour l'améliorer.`,
            type: NotificationType.ENRICHMENT_REJECTED,
            // Lien direct vers l'édition du brouillon avec un paramètre pour pré-sélectionner ce brouillon
            link: `/community/${communityId}/posts/create?draft_id=${postId}`,
            metadata: {
              communityId,
              postId,
            },
          });
        } catch (notifError) {
          console.error(
            "Erreur lors de l'envoi de la notification de rejet:",
            notifError
          );
        }
      }
    } else {
      // Si le statut ne change pas, envoyer une notification de feedback individuel
      try {
        await createBulkNotifications({
          userIds: [post.author_id],
          title:
            status === "APPROVED"
              ? "Nouveau feedback positif"
              : "Nouveau feedback négatif",
          message: `${contributor.fullName} a laissé un feedback sur votre post "${post.title}"`,
          type: NotificationType.FEEDBACK,
          link: `/community/${communityId}/posts/${postId}/review?creator=true`,
          metadata: {
            communityId,
            postId,
            reviewerId: session.user.id,
            reviewerName: contributor.fullName,
            content: content,
            status: status,
          },
        });
      } catch (notifError) {
        console.error(
          "Erreur lors de l'envoi de la notification de feedback:",
          notifError
        );
      }
    }

    return NextResponse.json(review);
  } catch (error) {
    console.log("Erreur:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la soumission de la révision" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: communityId, postId } = await params;

    // Vérifier que le post existe
    const post = await prisma.community_posts.findUnique({
      where: {
        id: parseInt(postId),
        community_id: parseInt(communityId),
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Vérifier si l'utilisateur est l'auteur du post
    const isAuthor = post.author_id === parseInt(session.user.id);

    // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
    const community = await prisma.community.findUnique({
      where: {
        id: parseInt(communityId),
      },
      include: {
        community_contributors: true,
      },
    });

    const isContributor = community.community_contributors.some(
      (contributor) => contributor.contributor_id === parseInt(session.user.id)
    );
    const isCreator = community.creator_id === parseInt(session.user.id);

    // Permettre l'accès si l'utilisateur est l'auteur OU contributeur OU créateur
    if (!isAuthor && !isContributor && !isCreator) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir ces reviews" },
        { status: 403 }
      );
    }

    // Récupérer toutes les reviews du post avec les infos utilisateur
    const reviews = await prisma.community_posts_reviews.findMany({
      where: {
        post_id: parseInt(postId),
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

    // Compter les votes positifs et négatifs
    const approvedCount = reviews.filter(
      (review) => review.status === "APPROVED"
    ).length;
    const rejectedCount = reviews.filter(
      (review) => review.status === "REJECTED"
    ).length;

    return NextResponse.json({
      reviews,
      stats: {
        total: reviews.length,
        approved: approvedCount,
        rejected: rejectedCount,
        approvalRate:
          reviews.length > 0 ? (approvedCount / reviews.length) * 100 : 0,
      },
    });
  } catch (error) {
    console.log("Erreur:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des reviews" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
