import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id: communityId } = await params;

    const user_id = session.user.id;

    // Vérifier que l'utilisateur est contributeur
    const membership = await prisma.community_contributors.findUnique({
      where: {
        community_id_contributor_id: {
          community_id: parseInt(communityId),
          contributor_id: parseInt(user_id),
        },
      },
    });

    const community = await prisma.community.findUnique({
      where: { id: parseInt(communityId) },
      select: { creator_id: true },
    });

    if (!membership && community.creator_id !== parseInt(user_id)) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette communauté" },
        { status: 403 }
      );
    }

    // Récupérer les avis déjà donnés par l'utilisateur sur les enrichissements
    const userEnrichmentReviews =
      await prisma.community_posts_enrichment_reviews.findMany({
        where: {
          user_id: parseInt(user_id),
        },
        select: {
          contribution_id: true,
        },
      });

    const reviewedEnrichmentIds = userEnrichmentReviews.map(
      (review) => review.contribution_id
    );

    console.log("reviewedEnrichmentIds", reviewedEnrichmentIds);

    const postsEnrichments = await prisma.community_posts_enrichments.findMany({
      where: {
        id: {
          notIn: reviewedEnrichmentIds,
        },
      },
      include: {
        user: true,
      },
    });

    console.log("postsEnrichments", postsEnrichments.length);

    // Récupérer les posts publiés qui ont des contributions en attente
    // const postsWithPendingContributions = await prisma.community_posts.findMany(
    //   {
    //     where: {
    //       community_id: parseInt(communityId),
    //       status: "PUBLISHED",
    //       community_posts_enrichments: {
    //         some: {
    //           status: "PENDING",
    //           // Exclure les enrichissements que l'utilisateur a déjà évalués
    //           AND: {
    //             id: {
    //               notIn: reviewedEnrichmentIds,
    //             },
    //           },
    //         },
    //       },
    //     },
    //     include: {
    //       user: {
    //         select: {
    //           id: true,
    //           fullName: true,
    //           profilePicture: true,
    //         },
    //       },
    //       community_posts_enrichments: {
    //         where: {
    //           status: "PENDING",
    //           // Exclure les enrichissements que l'utilisateur a déjà évalués
    //           AND: {
    //             id: {
    //               notIn: reviewedEnrichmentIds,
    //             },
    //           },
    //         },
    //         include: {
    //           user: {
    //             select: {
    //               id: true,
    //               fullName: true,
    //               profilePicture: true,
    //             },
    //           },
    //           community_posts_enrichment_reviews: {
    //             include: {
    //               user: {
    //                 select: {
    //                   id: true,
    //                   fullName: true,
    //                   profilePicture: true,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     orderBy: {
    //       created_at: "desc",
    //     },
    //   }
    // );

    // postsWithPendingContributions.forEach((post) => {
    //   post.community_posts_enrichments.forEach((enrichment) => {
    //     console.log("enrichment", enrichment);
    //   });
    // });

    return NextResponse.json(postsEnrichments);
  } catch (error) {
    console.log("Erreur:", error.stack);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des posts" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
