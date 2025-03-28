import Pusher from "pusher";
import PusherClient from "pusher-js";

// Pour le côté serveur
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Variable pour stocker l'instance unique du client
let pusherInstance: PusherClient | null = null;

// Fonction pour obtenir l'instance unique
export function getPusherClient() {
  // Vérifier si une connexion existe déjà dans cette fenêtre
  if (pusherInstance) {
    console.log("♻️ Réutilisation de l'instance Pusher existante (mémoire)");
    return pusherInstance;
  }

  // Vérifier si une connexion existe dans le sessionStorage
  if (typeof window !== "undefined") {
    const existingConnection = sessionStorage.getItem("pusher_connection_id");
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
  }

  // Créer une nouvelle connexion
  console.log("🔄 Création d'une nouvelle instance Pusher");
  pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });

  // Sauvegarder l'ID de connexion
  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      "pusher_connection_id",
      pusherInstance.connection.socket_id
    );
  }

  return pusherInstance;
}

// Fonction pour déconnecter proprement
export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pusher_connection_id");
    }
  }
}
