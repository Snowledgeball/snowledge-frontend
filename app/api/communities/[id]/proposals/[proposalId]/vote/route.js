import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id, proposalId } = params;
  const data = await request.json();
  const { vote } = data; // "approve" ou "reject"

  // Simuler l'enregistrement d'un vote
  // Dans une implémentation réelle, nous enregistrerions le vote dans la base de données

  return NextResponse.json({
    success: true,
    message: `Vote ${
      vote === "approve" ? "positif" : "négatif"
    } enregistré pour la proposition ${proposalId}`,
  });
}
