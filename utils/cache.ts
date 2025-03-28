"use client";

type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiration: number;
};

type StorageType = "local" | "session";

export class CacheManager {
  private storage: Storage | null = null;

  constructor(storageType: StorageType = "local") {
    // Ne pas tenter d'accéder à window/localStorage/sessionStorage pendant la construction
    // On les initialisera uniquement lors de l'appel des méthodes
    this.storage = null;
    this.storageType = storageType;
  }

  private storageType: StorageType;

  // Méthode pour initialiser le storage seulement quand nécessaire
  private getStorage(): Storage | null {
    if (this.storage !== null) {
      return this.storage;
    }

    if (typeof window === "undefined") {
      return null;
    }

    this.storage = this.storageType === "local" ? localStorage : sessionStorage;
    return this.storage;
  }

  get<T>(key: string): T | null {
    try {
      const storage = this.getStorage();
      if (!storage) return null;

      const item = storage.getItem(key);
      if (!item) return null;

      const parsedItem = JSON.parse(item) as CacheItem<T>;

      // Vérifier si l'item est expiré
      if (parsedItem.expiration < Date.now()) {
        this.remove(key);
        return null;
      }

      return parsedItem.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du cache:", error);
      return null;
    }
  }

  set<T>(key: string, data: T, expirationInMinutes = 5): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;

      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + expirationInMinutes * 60 * 1000,
      };
      storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Erreur lors du stockage dans le cache:", error);
    }
  }

  has(key: string): boolean {
    try {
      const storage = this.getStorage();
      if (!storage) return false;

      const item = storage.getItem(key);
      if (!item) return false;

      const parsedItem = JSON.parse(item) as CacheItem<unknown>;
      const isValid = parsedItem.expiration > Date.now();

      if (!isValid) {
        this.remove(key);
      }

      return isValid;
    } catch (error) {
      console.error("Erreur lors de la vérification du cache:", error);
      return false;
    }
  }

  remove(key: string): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;

      storage.removeItem(key);
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
    }
  }

  clear(): void {
    try {
      const storage = this.getStorage();
      if (!storage) return;

      storage.clear();
    } catch (error) {
      console.error("Erreur lors du nettoyage du cache:", error);
    }
  }
}

// Ajouter la clé PUSHER_CONNECTION aux CACHE_KEYS avant de les exporter
export const CACHE_KEYS = {
  POSTS: (communityId: string) => `posts-${communityId}`,
  COMMUNITY: (communityId: string) => `community-${communityId}`,
  PENDING_POSTS: (communityId: string) => `pending-posts-${communityId}`,
  PENDING_ENRICHMENTS: (communityId: string) =>
    `pending-enrichments-${communityId}`,
  USER_COMMUNITIES: (userId: string) => `user-communities-${userId}`,
  PUSHER_CONNECTION: () => "pusher_connection_id",
} as const;

// Ces instances ne seront créées que lorsqu'elles seront utilisées
// grâce à la méthode getStorage() qui vérifie window
export const localCache = new CacheManager("local");
export const sessionCache = new CacheManager("session");
