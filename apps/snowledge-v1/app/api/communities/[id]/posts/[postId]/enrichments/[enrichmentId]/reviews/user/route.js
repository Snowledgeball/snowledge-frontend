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

        const { id: communityId, postId, enrichmentId } = await params;

        // Vérifier que l'utilisateur est contributeur ou créateur de la communauté
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
                { error: "Vous n'êtes pas contributeur ou créateur de cette communauté" },
                { status: 403 }
            );
        }

        // Récupérer la révision de l'utilisateur
        const review = await prisma.community_posts_enrichment_reviews.findFirst({
            where: {
                contribution_id: parseInt(enrichmentId),
                user_id: parseInt(session.user.id),
            },
        });

        return NextResponse.json({
            hasVoted: !!review,
            review,
        });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de la révision" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 