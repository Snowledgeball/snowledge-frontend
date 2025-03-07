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

        const { id: communityId } = await params;

        // Compter le nombre de contributeurs
        const count = await prisma.community_contributors.count({
            where: {
                community_id: parseInt(communityId),
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération du nombre de contributeurs" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 