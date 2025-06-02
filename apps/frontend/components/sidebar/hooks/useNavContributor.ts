import { BookOpen, Frame, SquareTerminal } from "lucide-react";
import { features } from "@/config/features";
import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";

export function useNavContributor(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name);
  const tNavbar = useTranslations("navbar");

  return [
    features.community.contributor.contribute.enabled && {
      title: tNavbar("contribute"),
      url: `/${slug}/contributor/contribute`,
      icon: Frame,
      items: [
        features.community.contributor.contribute.propose && {
          title: tNavbar("propose"),
          url: `/${slug}/contributor/contribute/propose`,
        },
        features.community.contributor.contribute.myContributions && {
          title: tNavbar("my-contributions"),
          url: `/${slug}/contributor/contribute/my-contributions`,
        },
        features.community.contributor.contribute.validateIdeas && {
          title: tNavbar("validate-ideas"),
          url: `/${slug}/contributor/contribute/validate-ideas`,
        },
        features.community.contributor.contribute.collaborations && {
          title: tNavbar("collaborations"),
          url: `/${slug}/contributor/contribute/collaborations`,
        },
      ].filter(Boolean),
    },
    features.community.contributor.resourcesContrib.enabled && {
      title: tNavbar("ressources-contrib"),
      url: `/${slug}/contributor/ressources-contrib`,
      icon: BookOpen,
      items: [
        features.community.contributor.resourcesContrib.tutorials && {
          title: tNavbar("tutorials"),
          url: `/${slug}/contributor/ressources-contrib/tutorials`,
        },
        features.community.contributor.resourcesContrib.history && {
          title: tNavbar("history"),
          url: `/${slug}/contributor/ressources-contrib/history`,
        },
        features.community.contributor.resourcesContrib.leaderboard && {
          title: tNavbar("leaderboard"),
          url: `/${slug}/contributor/ressources-contrib/leaderboard`,
        },
      ].filter(Boolean),
    },
    features.community.contributor.tools.enabled && {
      title: tNavbar("tools"),
      url: `/${slug}/contributor/tools`,
      icon: SquareTerminal,
      items: [
        features.community.contributor.tools.badges && {
          title: tNavbar("badges"),
          url: `/${slug}/contributor/tools/badges`,
        },
        features.community.contributor.tools.validationRequests && {
          title: tNavbar("validation-requests"),
          url: `/${slug}/contributor/tools/validation-requests`,
        },
        features.community.contributor.tools.stats && {
          title: tNavbar("stats"),
          url: `/${slug}/contributor/tools/stats`,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: any;
    items?: { title: string; url: string }[];
  }[];
}
