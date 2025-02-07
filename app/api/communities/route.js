import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        // Récupérer les données du body
        const body = await request.json();
        const { name, description, category } = body;

        // Validation des données
        if (!name || !description) {
            return NextResponse.json(
                { error: "Le nom et la description sont requis" },
                { status: 400 }
            );
        }

        // Créer la communauté
        const newCommunity = await prisma.community.create({
            data: {
                name: name,
                description: description,
                creator_id: parseInt(session.user.id), // Assurez-vous que l'ID est un nombre
            }
        });

        return NextResponse.json({
            message: "Communauté créée avec succès",
            id: newCommunity.id,
            community: newCommunity
        });

    } catch (error) {
        console.error("Erreur lors de la création de la communauté:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création de la communauté" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Optionnel : Endpoint pour récupérer toutes les communautés
export async function GET() {
    try {
        const communities = await prisma.community.findMany({
            include: {
                community_contributors: true,
                community_learners: true,
            }
        });

        return NextResponse.json(communities);
    } catch (error) {
        console.error("Erreur lors de la récupération des communautés:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des communautés" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 