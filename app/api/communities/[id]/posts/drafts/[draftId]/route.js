import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Récupérer un brouillon spécifique
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, draftId } = await params;

        // Récupérer le brouillon
        const draft = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(draftId),
                community_id: parseInt(communityId),
                author_id: parseInt(session.user.id),
                status: "DRAFT",
            },
        });

        if (!draft) {
            return NextResponse.json(
                { error: "Brouillon non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json(draft);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération du brouillon" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Mettre à jour un brouillon
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, draftId } = await params;
        const { title, content, cover_image_url, tag, accept_contributions } = await request.json();

        // Vérifier que le brouillon existe et appartient à l'utilisateur
        const existingDraft = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(draftId),
                author_id: parseInt(session.user.id),
            },
        });

        if (!existingDraft) {
            return NextResponse.json(
                { error: "Brouillon non trouvé ou vous n'êtes pas l'auteur" },
                { status: 404 }
            );
        }

        // Mettre à jour le brouillon
        const updatedDraft = await prisma.community_posts.update({
            where: {
                id: parseInt(draftId),
            },
            data: {
                title: title || existingDraft.title,
                content: content || existingDraft.content,
                cover_image_url: cover_image_url || existingDraft.cover_image_url,
                tag: tag || existingDraft.tag,
                accept_contributions: accept_contributions !== undefined ? accept_contributions : existingDraft.accept_contributions,
                updated_at: new Date(),
            },
        });

        return NextResponse.json(updatedDraft);
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du brouillon" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Supprimer un brouillon
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { id: communityId, draftId } = await params;

        // Vérifier que le brouillon existe et appartient à l'utilisateur
        const existingDraft = await prisma.community_posts.findUnique({
            where: {
                id: parseInt(draftId),
                author_id: parseInt(session.user.id),
            },
        });

        if (!existingDraft) {
            return NextResponse.json(
                { error: "Brouillon non trouvé ou vous n'êtes pas l'auteur" },
                { status: 404 }
            );
        }

        // Supprimer le brouillon
        await prisma.community_posts.delete({
            where: {
                id: parseInt(draftId),
            },
        });

        return NextResponse.json({ message: "Brouillon supprimé avec succès" });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du brouillon" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 