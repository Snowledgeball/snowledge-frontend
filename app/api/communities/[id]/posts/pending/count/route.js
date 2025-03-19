import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId } = await params;

        // Vérifier que l'utilisateur est contributeur ou créateur
        const isContributor = await prisma.community_contributors.findUnique({
            where: {
                community_id_contributor_id: {
                    community_id: parseInt(communityId),
                    contributor_id: parseInt(session.user.id)
                }
            }
        });

        const community = await prisma.community.findUnique({
            where: { id: parseInt(communityId) }
        });

        if (!isContributor && community.creator_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        const count = await prisma.community_posts_pending.count({
            where: { community_id: parseInt(communityId) }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors du comptage des posts en attente" },
            { status: 500 }
        );
    }
} 