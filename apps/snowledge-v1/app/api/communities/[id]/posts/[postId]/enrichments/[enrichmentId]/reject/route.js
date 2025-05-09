import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const { id, postId, enrichmentId } = params;

  // Simuler le rejet d'un enrichissement
  // Dans une implémentation réelle, nous mettrions à jour le statut de l'enrichissement dans la base de données

  return NextResponse.json({
    success: true,
    message: `Enrichissement ${enrichmentId} rejeté pour le post ${postId}`,
  });
}
