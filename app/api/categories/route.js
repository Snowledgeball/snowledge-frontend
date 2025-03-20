import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Vérifier si l'utilisateur a créé au moins une communauté
        const communityCount = await prisma.community.count({
            where: {
                creator_id: parseInt(session.user.id)
            }
        });

        if (communityCount === 0) {
            return NextResponse.json(
                { error: "Seuls les créateurs de communautés peuvent créer des catégories" },
                { status: 403 }
            );
        }

        const { name, label } = await request.json();

        // Vérifier si la catégorie existe déjà
        const existingCategory = await prisma.community_category.findFirst({
            where: { name }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "Cette catégorie existe déjà" },
                { status: 400 }
            );
        }

        const category = await prisma.community_category.create({
            data: {
                name,
                label
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Erreur création catégorie:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la catégorie" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const categories = await prisma.community_category.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur lors de la récupération des catégories" },
            { status: 500 }
        );
    }
} 