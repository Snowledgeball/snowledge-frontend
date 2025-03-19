import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId } = await params;

        // Compter le nombre de votes
        const count = await prisma.community_posts_reviews.count({
            where: {
                post_id: parseInt(postId),
            },
        });

        // Compter les votes positifs et négatifs
        const approvedCount = await prisma.community_posts_reviews.count({
            where: {
                post_id: parseInt(postId),
                status: "APPROVED",
            },
        });

        const rejectedCount = await prisma.community_posts_reviews.count({
            where: {
                post_id: parseInt(postId),
                status: "REJECTED",
            },
        });

        return NextResponse.json({
            count,
            approvedCount,
            rejectedCount
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération du nombre de votes" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 