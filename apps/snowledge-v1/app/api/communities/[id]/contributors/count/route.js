import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
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
