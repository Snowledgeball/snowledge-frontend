import {
  Settings2,
  Users,
  UserRoundPlus,
  BarChart3,
  Link2,
  CheckSquare,
  Gift,
} from "lucide-react";
import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";
import { features } from "@/config/features";

export function useNavMyCommunity(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name);
  const tNavbar = useTranslations("navbar");

  return [
    features.community.myCommunity.generalInformations && {
      title: tNavbar("general-informations"),
      url: `/${slug}/my-community/general-informations`,
      icon: Settings2,
    },
    features.community.myCommunity.integrations && {
      title: tNavbar("integrations"),
      url: `/${slug}/my-community/integrations`,
      icon: Link2,
    },
    features.community.myCommunity.trendsAnalytics && {
      title: tNavbar("trends-analytics"),
      url: `/${slug}/my-community/trends-analytics`,
      icon: BarChart3,
    },
    features.community.myCommunity.rewards && {
      title: tNavbar("rewards"),
      url: `/${slug}/my-community/rewards`,
      icon: Gift,
    },
    features.community.myCommunity.topicsToValidate && {
      title: tNavbar("topics-to-validate"),
      url: `/${slug}/my-community/topics-to-validate`,
      icon: CheckSquare,
    },
    features.community.myCommunity.members && {
      title: tNavbar("members"),
      url: `/${slug}/my-community/members`,
      icon: Users,
    },
    features.community.myCommunity.invitations && {
      title: tNavbar("invitations"),
      url: `/${slug}/my-community/invitations`,
      icon: UserRoundPlus,
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
}
