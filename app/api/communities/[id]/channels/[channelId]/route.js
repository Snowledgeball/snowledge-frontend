import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// DELETE - Supprimer un canal
export async function DELETE(request, { params }) {
    try {
        const { channelId } = await params;
        // Vérifier que ce n'est pas un canal par défaut
        const channel = await prisma.community_channels.findUnique({
            where: { id: parseInt(channelId) }
        });

        if (!channel || ['Chat général', 'Bienvenue', 'Annonces'].includes(channel.name)) {
            return NextResponse.json(
                { error: 'Impossible de supprimer un canal par défaut' },
                { status: 403 }
            );
        }

        await prisma.community_channels.delete({
            where: { id: parseInt(channelId) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 