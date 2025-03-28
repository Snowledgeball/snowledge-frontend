type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiration: number;
};

type StorageType = "local" | "session";

export class CacheManager {
  private storage: Storage;

  constructor(storageType: StorageType = "local") {
    if (typeof window === "undefined") {
      throw new Error("CacheManager ne peut être utilisé que côté client");
    }
    this.storage = storageType === "local" ? localStorage : sessionStorage;
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
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
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + expirationInMinutes * 60 * 1000,
      };
      this.storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Erreur lors du stockage dans le cache:", error);
    }
  }

  has(key: string): boolean {
    try {
      const item = this.storage.getItem(key);
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
      this.storage.removeItem(key);
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error("Erreur lors du nettoyage du cache:", error);
    }
  }
}

// Créer des instances par défaut pour localStorage et sessionStorage
export const localCache = new CacheManager("local");
export const sessionCache = new CacheManager("session");

// Constantes pour les clés de cache
export const CACHE_KEYS = {
  POSTS: (communityId: string) => `posts-${communityId}`,
  COMMUNITY: (communityId: string) => `community-${communityId}`,
  PENDING_POSTS: (communityId: string) => `pending-posts-${communityId}`,
  PENDING_ENRICHMENTS: (communityId: string) =>
    `pending-enrichments-${communityId}`,
  USER_COMMUNITIES: (userId: string) => `user-communities-${userId}`,
} as const;
