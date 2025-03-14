import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebaseConfig";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from "firebase/firestore";

/**
 * Récupère tous les messages envoyés par un utilisateur spécifique depuis Firebase
 * @param {Request} request - La requête HTTP
 * @param {Object} params - Les paramètres de la route, contenant l'ID de l'utilisateur
 * @returns {Promise<NextResponse>} - Réponse contenant les messages de l'utilisateur
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Dans ChatBox.tsx, userId est stocké comme une chaîne de caractères
        // Nous devons donc utiliser l'ID sous forme de chaîne
        const userId = id.toString();

        console.log("Recherche de messages pour l'utilisateur:", userId);

        // Vérification de l'authentification (optionnelle selon votre politique de sécurité)
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        // Créer la requête pour récupérer les messages
        const messagesQuery = query(
            collection(db, "messages"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
        );

        // Exécuter la requête
        const messagesSnapshot = await getDocs(messagesQuery);

        // Transformer les documents en objets JavaScript
        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().timestamp ? new Date(doc.data().timestamp.seconds * 1000).toISOString() : null
        }));

        console.log(`Nombre de messages trouvés: ${messages.length}`);

        // Ajouter des en-têtes de cache
        const headers = new Headers();
        headers.append("Cache-Control", "max-age=300, s-maxage=300");

        return NextResponse.json(
            { messages },
            {
                status: 200,
                headers
            }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        return NextResponse.json(
            { error: "Erreur serveur", messages: [] },
            { status: 500 }
        );
    }
} 