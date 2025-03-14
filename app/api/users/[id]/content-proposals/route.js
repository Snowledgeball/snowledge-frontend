import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();


export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const userId = parseInt(id);

        // Vérifier si l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Récupérer toutes les demandes de contribution (contributor requests) créées par l'utilisateur
        const contributorRequests = await prisma.community_contributors_requests.findMany({
            where: {
                requester_id: userId
            },
            include: {
                community: {
                    select: {
                        id: true,
                        name: true,
                        image_url: true
                    }
                }
            },
            orderBy: {
                created_at: "desc"
            }
        });

        // Transformer les données pour avoir un format uniforme
        const contentProposals = contributorRequests.map(request => ({
            id: request.id,
            title: `Demande de contribution: ${request.expertise_domain}`,
            description: request.justification,
            status: request.status || 'PENDING',
            created_at: request.created_at,
            type: 'contributor_request',
            community: {
                id: request.community.id,
                name: request.community.name,
                image_url: request.community.image_url
            }
        }));

        // Ajouter des en-têtes de cache
        const headers = new Headers();
        headers.append("Cache-Control", "max-age=300, s-maxage=300");

        return NextResponse.json(
            { contentProposals: contentProposals || [] },
            {
                status: 200,
                headers
            }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des propositions de contenu:", error.stack);
        return NextResponse.json(
            { error: "Erreur serveur", contentProposals: [] },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 