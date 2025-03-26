import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkContributionStatus } from "@/lib/contributionUtils";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: communityId, postId, enrichmentId } = await params;
    const { content, status } = await request.json();

    // Vérifier que l'utilisateur est contributeur
    const contributor = await prisma.community_contributors.findUnique({
      where: {
        community_id_contributor_id: {
          community_id: parseInt(communityId),
          contributor_id: parseInt(session.user.id),
        },
      },
    });

    const creator = await prisma.community.findUnique({
      where: {
        id: parseInt(communityId),
        creator_id: parseInt(session.user.id),
      },
    });

    if (!contributor && !creator) {
      return NextResponse.json(
        {
          error: "Vous n'êtes pas contributeur ou créateur de cette communauté",
        },
        { status: 403 }
      );
    }

    // Vérifier que la révision existe
    const existingReview =
      await prisma.community_posts_enrichment_reviews.findFirst({
        where: {
          contribution_id: parseInt(enrichmentId),
          user_id: parseInt(session.user.id),
        },
      });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Aucune révision trouvée" },
        { status: 404 }
      );
    }

    // Mettre à jour la révision
    const updatedReview =
      await prisma.community_posts_enrichment_reviews.update({
        where: {
          id: existingReview.id,
        },
        data: {
          content,
          status,
        },
      });

    // Récupérer les informations sur l'enrichissement et son auteur
    const enrichment = await prisma.community_posts_enrichments.findUnique({
      where: {
        id: parseInt(enrichmentId),
      },
      include: {
        user: true,
        community_posts: {
          select: {
            title: true,
          },
        },
      },
    });

    // Obtenir le nombre de contributeurs pour vérifier si la contribution peut être automatiquement approuvée ou rejetée
    const contributorsCount = await prisma.community_contributors.count({
      where: {
        community_id: parseInt(communityId),
      },
    });

    // Vérifier le statut de l'enrichissement après cette mise à jour
    const { shouldUpdate, newStatus } = await checkContributionStatus(
      parseInt(enrichmentId),
      contributorsCount
    );

    // Mettre à jour le statut de la contribution si nécessaire
    if (shouldUpdate) {
      await prisma.community_posts_enrichments.update({
        where: {
          id: parseInt(enrichmentId),
        },
        data: {
          status: newStatus,
        },
      });

      // Créer une notification pour l'auteur de la contribution
      if (newStatus === "APPROVED" || newStatus === "REJECTED") {
        await createBulkNotifications({
          userIds: [enrichment.user.id],
          type:
            newStatus === "APPROVED"
              ? NotificationType.ENRICHMENT_APPROVED
              : NotificationType.ENRICHMENT_REJECTED,
          title:
            newStatus === "APPROVED"
              ? "Votre enrichissement a été approuvé"
              : "Votre enrichissement a été rejeté",
          message: `Votre enrichissement sur "${
            enrichment.community_posts.title
          }" a été ${
            newStatus === "APPROVED" ? "approuvé" : "rejeté"
          } par la communauté.`,
          link: `/community/${communityId}/posts/${postId}`,
          metadata: {
            communityId: communityId,
            postId: postId,
            enrichmentId: enrichmentId,
          },
        });
      }
    } else {
      // Créer une notification pour l'auteur de la contribution pour indiquer que son enrichissement a été modifié
      await createBulkNotifications({
        userIds: [enrichment.user_id],
        type: NotificationType.FEEDBACK,
        title: "Vote modifié",
        message: `Un vote sur votre enrichissement "${enrichment.community_posts.title}" a été modifié.`,
        link: `/community/${communityId}/posts/${postId}/enrichments/${enrichmentId}/review?creator=true`,
        metadata: {
          communityId: communityId,
          postId: postId,
          enrichmentId: enrichmentId,
        },
      });
    }

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.log("Erreur:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la révision" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
