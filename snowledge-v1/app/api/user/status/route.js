import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ isContentCreator: false });
        }

        // Vérifier si l'utilisateur a créé au moins une communauté
        const communityCount = await prisma.community.count({
            where: {
                creator_id: parseInt(session.user.id)
            }
        });

        return NextResponse.json({
            isContentCreator: communityCount > 0
        });

    } catch (error) {
        console.error("Erreur lors de la vérification du statut:", error);
        return NextResponse.json({ isContentCreator: false });
    }
} 