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

export function useNavCreator(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name);
  const tNavbar = useTranslations("navbar");

  return [
    {
      title: tNavbar("general-informations"),
      url: `/${slug}/my-community/general-informations`,
      icon: Settings2,
    },
    {
      title: tNavbar("integrations"),
      url: `/${slug}/my-community/integrations`,
      icon: Link2,
    },
    {
      title: tNavbar("trends-analytics"),
      url: `/${slug}/my-community/trends-analytics`,
      icon: BarChart3,
    },
    {
      title: tNavbar("rewards"),
      url: `/${slug}/my-community/rewards`,
      icon: Gift,
    },
    {
      title: tNavbar("topics-to-validate"),
      url: `/${slug}/my-community/topics-to-validate`,
      icon: CheckSquare,
    },
    {
      title: tNavbar("members"),
      url: `/${slug}/my-community/members`,
      icon: Users,
    },
    {
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
