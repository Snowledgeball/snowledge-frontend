import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Récupérer tous les brouillons
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId } = params;

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

        // Récupérer les brouillons
        const drafts = await prisma.community_posts.findMany({
            where: {
                community_id: parseInt(communityId),
                author_id: parseInt(session.user.id),
                status: "DRAFT",
            },
            orderBy: {
                updated_at: "desc",
            },
        });

        return NextResponse.json(drafts);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des brouillons" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Créer un nouveau brouillon
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId } = params;
        const { title, content, cover_image_url, tag, accept_contributions } = await request.json();

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

        // Créer le brouillon
        const draft = await prisma.community_posts.create({
            data: {
                community_id: parseInt(communityId),
                author_id: parseInt(session.user.id),
                title: title || "Sans titre",
                content: content || "",
                cover_image_url: cover_image_url || "",
                tag: tag || "",
                accept_contributions: accept_contributions || false,
                status: "DRAFT",
            },
        });

        return NextResponse.json(draft);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la création du brouillon" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 