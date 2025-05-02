"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { getPusherClient, disconnectPusher } from "@/lib/pusher-client";
import PusherClient from "pusher-js";
import { useMounted } from "@/lib/hooks/useMounted";

// Définir les types d'événements que nous voulons écouter globalement
interface PusherEvents {
  // key est le nom du canal, value est la fonction de callback
  "post-created": (data: { communityId: string; timestamp: number }) => void;
  // Ajoutez d'autres événements si nécessaire
}

interface PusherContextType {
  client: PusherClient | null;
}

// Création du contexte avec une valeur par défaut sûre
const PusherContext = createContext<PusherContextType>({ client: null });

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  const mounted = useMounted();
  const [client, setClient] = useState<PusherClient | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log("🔄 Déconnexion après inactivité");
      disconnectPusher();
      setClient(null);
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    // Seulement exécuter côté client
    if (typeof window === "undefined") return;

    // Écouter l'activité de l'utilisateur
    const handleActivity = () => resetInactivityTimeout();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [resetInactivityTimeout]);

  useEffect(() => {
    // Ne pas initialiser Pusher pendant le prérendu
    if (!mounted || typeof window === "undefined") return;

    console.log("🔄 Initialisation de la connexion Pusher globale");
    const pusherClient = getPusherClient();
    setClient(pusherClient);

    return () => {
      console.log("🔄 Fermeture de la connexion Pusher globale");
      disconnectPusher();
    };
  }, [mounted]);

  // Valeur sûre pour le SSR
  const contextValue =
    typeof window === "undefined"
      ? { client: null }
      : { client: mounted ? client : null };

  return (
    <PusherContext.Provider value={contextValue}>
      {children}
    </PusherContext.Provider>
  );
};

// Hook customisé avec protection pour le SSR
export const usePusher = () => {
  // Vérifie si nous sommes dans un environnement navigateur
  if (typeof window === "undefined") {
    // Retourne une valeur par défaut sûre pour le SSR
    return { client: null };
  }

  // Utilisation normale du contexte côté client
  return useContext(PusherContext);
};
