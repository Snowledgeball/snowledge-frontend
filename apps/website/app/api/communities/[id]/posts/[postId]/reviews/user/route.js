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

        // Vérifier si l'utilisateur est un contributeur ou le créateur de la communauté
        const community = await prisma.community.findFirst({
            where: {
                id: parseInt(communityId),
            },
            include: {
                community_contributors: true,
            },
        });

        if (!community) {
            return NextResponse.json({ error: "Communauté non trouvée" }, { status: 404 });
        }

        const isContributor = community.community_contributors.some(
            (contributor) => contributor.contributor_id === parseInt(session.user.id)
        );
        const isCreator = community.creator_id === parseInt(session.user.id);

        // Permettre l'accès si l'utilisateur est contributeur OU créateur de la communauté
        if (!isContributor && !isCreator) {
            return NextResponse.json(
                { error: "Vous devez être un contributeur pour voir votre vote" },
                { status: 403 }
            );
        }

        // Vérifier si l'utilisateur a déjà voté
        const review = await prisma.community_posts_reviews.findFirst({
            where: {
                post_id: parseInt(postId),
                reviewer_id: parseInt(session.user.id),
            },
        });

        return NextResponse.json({
            hasVoted: !!review,
            review
        });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la vérification du vote" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 