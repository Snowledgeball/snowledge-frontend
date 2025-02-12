import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// GET /api/communities/[id]/settings
export async function GET(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const communityId = parseInt(id);

        // Récupérer les informations de la communauté et sa présentation
        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                community_presentation: true,
            },
        });

        if (!community) {
            return NextResponse.json(
                { error: "Communauté non trouvée" },
                { status: 404 }
            );
        }

        // Formater la réponse
        const response = {
            id: community.id,
            name: community.name,
            description: community.description,
            image_url: community.image_url,
            presentation: community.community_presentation
                ? {
                    video_url: community.community_presentation.video_url,
                    topic_details: community.community_presentation.topic_details,
                    code_of_conduct: community.community_presentation.code_of_conduct,
                    disclaimers: community.community_presentation.disclaimers,
                }
                : null,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

// PUT /api/communities/[id]/settings
export async function PUT(
    request,
    { params }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id } = await params;
        const communityId = parseInt(id);
        const data = await request.json();

        // Vérifier que l'utilisateur est bien le créateur ou un contributeur de la communauté

        const community = await prisma.community.findUnique({
            where: { id: communityId },
            include: {
                community_contributors: true,
            },
        });

        if (!community) {
            return NextResponse.json(
                { error: "Communauté non trouvée" },
                { status: 404 }
            );
        }

        // Mettre à jour les informations de base de la communauté
        await prisma.community.update({
            where: { id: communityId },
            data: {
                name: data.name,
                description: data.description,
                image_url: data.image_url,
            },
        });

        // Mettre à jour ou créer la présentation
        if (data.presentation) {
            await prisma.community_presentation.upsert({
                where: { community_id: communityId },
                create: {
                    community_id: communityId,
                    video_url: data.presentation.video_url,
                    topic_details: data.presentation.topic_details,
                    code_of_conduct: data.presentation.code_of_conduct,
                    disclaimers: data.presentation.disclaimers,
                },
                update: {
                    video_url: data.presentation.video_url,
                    topic_details: data.presentation.topic_details,
                    code_of_conduct: data.presentation.code_of_conduct,
                    disclaimers: data.presentation.disclaimers,
                },
            });
        }

        return NextResponse.json({
            message: "Paramètres mis à jour avec succès",
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour des paramètres:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}