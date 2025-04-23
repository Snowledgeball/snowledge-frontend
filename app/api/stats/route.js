import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer toutes les stats en parallèle pour de meilleures performances
    const [totalCommunities, totalMembers, totalContributions, totalPosts] =
      await Promise.all([
        prisma.community.count(),
        prisma.community_learners.count(),
        prisma.community_posts_enrichments.count(),
        prisma.community_posts.count(),
      ]);

    // Calculer le taux d'engagement (enrichissements par post)
    const engagementRate =
      totalPosts > 0 ? (totalContributions / totalPosts).toFixed(2) : 0;

    const response = {
      stats: {
        communities: {
          total: totalCommunities,
        },
        members: {
          total: totalMembers,
        },
        enrichments: {
          total: totalContributions,
        },
        engagement: {
          rate: engagementRate,
          posts: totalPosts,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "error_fetching_stats" },
      { status: 500 }
    );
  }
}
