import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id } = params;
    const data = await req.json();

    const notifRef = doc(db, "notifications", id);
    const notifSnap = await getDoc(notifRef);

    if (!notifSnap.exists()) {
      return NextResponse.json(
        { error: "Notification non trouvée" },
        { status: 404 }
      );
    }

    const notifData = notifSnap.data();

    if (notifData.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé à modifier cette notification" },
        { status: 403 }
      );
    }

    await updateDoc(notifRef, data);

    return NextResponse.json({ id, ...notifData, ...data });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la notification" },
      { status: 500 }
    );
  }
}
