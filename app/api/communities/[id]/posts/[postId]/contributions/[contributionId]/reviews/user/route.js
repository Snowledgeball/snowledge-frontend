import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, postId, contributionId } = await params;

        // Vérifier que l'utilisateur est contributeur
        const membership = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id),
                },
            },
        });

        if (!membership) {
            return NextResponse.json(
                { error: "Vous n'êtes pas contributeur de cette communauté" },
                { status: 403 }
            );
        }

        // Récupérer la révision de l'utilisateur
        const review = await prisma.community_posts_contribution_reviews.findFirst({
            where: {
                contribution_id: parseInt(contributionId),
                user_id: parseInt(session.user.id),
            },
        });

        return NextResponse.json({
            hasVoted: !!review,
            review,
        });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de la révision" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 