import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Supprimer un commentaire
export async function DELETE(request, { params }) {
    try {
        console.log("ici0");
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        console.log("ici1");

        const { commentId } = await params;

        // Vérifier que l'utilisateur est l'auteur du commentaire
        const comment = await prisma.community_posts_comments.findUnique({
            where: { id: parseInt(commentId) }
        });

        console.log("ici2");

        if (!comment || comment.author_id !== parseInt(session.user.id)) {
            console.log("comment", comment);
            console.log("comment.author_id", comment.author_id);
            console.log("session.user.id", session.user.id);
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        console.log("ici1");

        await prisma.community_posts_comments.delete({
            where: { id: parseInt(commentId) }
        });

        console.log("ici3");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("Erreur:", error.stack);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du commentaire" },
            { status: 500 }
        );
    }
}

// Modifier un commentaire
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { commentId } = await params;
        const { content, modifiedAt } = await request.json();

        // Vérifier que l'utilisateur est l'auteur du commentaire
        const comment = await prisma.community_posts_comments.findUnique({
            where: { id: parseInt(commentId) }
        });

        if (!comment || comment.author_id !== parseInt(session.user.id)) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
        }

        await prisma.community_posts_comments.update({
            where: { id: parseInt(commentId) },
            data: {
                content,
                modified_at: modifiedAt
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur:", error);
        return NextResponse.json(
            { error: "Erreur lors de la modification du commentaire" },
            { status: 500 }
        );
    }
} 