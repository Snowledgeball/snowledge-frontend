import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Contribution,
  TopicProposal,
  Membership,
  contributorsCache,
  CACHE_DURATION,
} from "./types";
import { combineContributions } from "./utils";

/**
 * Hook pour récupérer le nombre de contributeurs
 */
export const useContributorsCount = (communityId: string) => {
  const [contributorsCount, setContributorsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const fetchContributorsCount = useCallback(
    async (forceRefresh = false) => {
      try {
        const cacheKey = `contributors-count-${communityId}`;
        const now = Date.now();

        // Vérifier si les données sont dans le cache et si elles sont encore valides
        if (!forceRefresh && contributorsCache.has(cacheKey)) {
          const cachedData = contributorsCache.get(cacheKey)!;
          if (now - cachedData.timestamp < CACHE_DURATION) {
            setContributorsCount(cachedData.count);
            return;
          }
        }

        const response = await fetch(
          `/api/communities/${communityId}/contributors/count`,
          {
            headers: {
              "Cache-Control": "max-age=120", // Cache de 2 minutes
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setContributorsCount(data.count);

          // Mettre en cache les données avec un timestamp
          contributorsCache.set(cacheKey, {
            count: data.count,
            timestamp: now,
          });
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nombre de contributeurs:",
          error
        );
        toast.error(t("voting.contributors_load_error"));
      } finally {
        setIsLoading(false);
      }
    },
    [communityId, t]
  );

  useEffect(() => {
    fetchContributorsCount();
  }, [fetchContributorsCount]);

  return { contributorsCount, fetchContributorsCount, isLoading };
};

/**
 * Hook pour récupérer les propositions
 */
export const useProposals = (communityId: string) => {
  const [proposals, setProposals] = useState<TopicProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const fetchProposals = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/communities/${communityId}/proposals`);

      if (!response.ok) {
        throw new Error(t("errors.failed_to_fetch"));
      }

      const data = await response.json();
      setProposals(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des propositions:", error);
      toast.error(t("voting.proposals_load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [communityId, t]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return { proposals, fetchProposals, isLoading };
};

/**
 * Hook pour récupérer les contributions
 */
export const useContributions = (
  communityId: string,
  membership: Membership | null
) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();

  const refreshContributions = useCallback(async () => {
    if (!membership) return;
    if (!membership.isContributor && !membership.isCreator) return;

    setIsRefreshing(true);

    try {
      // Récupérer les propositions de création
      const creationsResponse = await fetch(
        `/api/communities/${communityId}/posts/pending`
      );

      if (!creationsResponse.ok) {
        throw new Error(
          `Erreur lors de la récupération des créations : ${creationsResponse.status}`
        );
      }

      const creationsData = await creationsResponse.json();

      // Récupérer les enrichissements en attente
      const enrichmentsResponse = await fetch(
        `/api/communities/${communityId}/posts/with-pending-enrichments`
      );

      if (!enrichmentsResponse.ok) {
        throw new Error(
          `Erreur lors de la récupération des enrichissements : ${enrichmentsResponse.status}`
        );
      }

      const enrichmentsData = await enrichmentsResponse.json();

      // Combiner et trier les contributions
      const allContributions = combineContributions(
        creationsData,
        enrichmentsData
      );
      setContributions(allContributions);
    } catch (error) {
      console.error("Erreur lors de la récupération des contributions:", error);
      toast.error(t("voting.contributions_load_error"));
    } finally {
      setIsRefreshing(false);
    }
  }, [communityId, membership, t]);

  useEffect(() => {
    if (membership?.isContributor || membership?.isCreator) {
      refreshContributions();
    }
  }, [membership, refreshContributions]);

  return { contributions, refreshContributions, isRefreshing };
};

/**
 * Hook pour récupérer les informations de membership
 */
export const useMembership = (communityId: string) => {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const fetchMembership = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/communities/${communityId}/membership`
      );

      if (!response.ok) {
        throw new Error(t("errors.failed_to_fetch"));
      }

      const data = await response.json();
      setMembership(data);
      return data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des informations de membre:",
        error
      );
      toast.error(t("voting.membership_load_error"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [communityId, t]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return { membership, fetchMembership, isLoading };
};
