"use client";

import PusherClient from "pusher-js";
import { sessionCache, CACHE_KEYS } from "@/utils/cache";

// Variable pour stocker l'instance unique du client
let pusherInstance: PusherClient | null = null;

export function getPusherClient() {
  // Vérifier qu'on est côté client
  if (typeof window === "undefined") {
    return null;
  }

  // Vérifier si une connexion existe déjà en mémoire
  if (pusherInstance) {
    console.log("♻️ Réutilisation de l'instance Pusher existante (mémoire)");
    return pusherInstance;
  }

  try {
    // Vérifier si une connexion existe dans le cache
    const existingConnection = sessionCache.get<string>(
      CACHE_KEYS.PUSHER_CONNECTION()
    );
    if (existingConnection) {
      console.log("♻️ Réutilisation de l'instance Pusher existante (session)");
      pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        auth: {
          headers: {
            connection_id: existingConnection,
          },
        },
      });
      return pusherInstance;
    }

    // Créer une nouvelle connexion
    console.log("🔄 Création d'une nouvelle instance Pusher");
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Sauvegarder l'ID de connexion dans le cache
    sessionCache.set(
      CACHE_KEYS.PUSHER_CONNECTION(),
      pusherInstance.connection.socket_id,
      60 // expire après 60 minutes
    );
  } catch (error) {
    console.error("⚠️ Erreur avec le cache Pusher:", error);
  }

  return pusherInstance;
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
    try {
      sessionCache.remove(CACHE_KEYS.PUSHER_CONNECTION());
    } catch (error) {
      console.error("⚠️ Erreur lors de la déconnexion Pusher:", error);
    }
  }
}
