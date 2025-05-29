import {
  Settings2,
  Users,
  UserRoundPlus,
  DollarSign,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { features } from "@/config/features";
import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";

export function useNavCreator(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name);
  const tNavbar = useTranslations("navbar");

  return [
    features.community.creator.settings && {
      title: tNavbar("settings"),
      url: `/${slug}/creator/settings`,
      icon: Settings2,
    },
    features.community.creator.members && {
      title: tNavbar("members"),
      url: `/${slug}/creator/members`,
      icon: Users,
    },
    features.community.creator.invite && {
      title: tNavbar("invite"),
      url: `/${slug}/creator/invite`,
      icon: UserRoundPlus,
    },
    features.community.creator.pricing && {
      title: tNavbar("pricing"),
      url: `/${slug}/creator/pricing`,
      icon: DollarSign,
    },
    features.community.creator.moderation && {
      title: tNavbar("moderation"),
      url: `/${slug}/creator/moderation`,
      icon: ShieldCheck,
    },
    features.community.creator.logs && {
      title: tNavbar("logs"),
      url: `/${slug}/creator/logs`,
      icon: FileText,
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
}
