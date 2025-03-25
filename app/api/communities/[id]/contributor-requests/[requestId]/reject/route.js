import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createBulkNotifications } from "@/lib/notifications";
import { NotificationType } from "@/types/notification";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { rejection_reason } = await req.json();
    const { id, requestId } = await params;
    const communityId = parseInt(id);
    const reqId = parseInt(requestId);

    // Vérifier si l'utilisateur est le créateur de la communauté
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { creator_id: true, name: true },
    });

    console.log("community", community);
    if (!community || community.creator_id !== parseInt(session.user.id)) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 403 });
    }

    const contributorRequest =
      await prisma.community_contributors_requests.findUnique({
        where: {
          id: reqId,
          community_id: communityId,
        },
        select: {
          requester_id: true,
        },
      });

    await prisma.community_contributors_requests.update({
      where: {
        id: reqId,
        community_id: communityId,
      },
      data: {
        status: "REJECTED",
        updated_at: new Date(),
        rejection_reason: rejection_reason,
      },
    });

    await createBulkNotifications({
      userIds: [contributorRequest.requester_id],
      title: `Demande refusée`,
      message: `Votre demande de contribution à la communauté ${community.name} a été refusée`,
      type: NotificationType.CONTRIBUTOR_REFUSED,
      link: `/community/${communityId}/`,
      metadata: {
        communityId,
      },
    });

    return NextResponse.json(
      { message: "Demande refusée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du refus de la demande:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
