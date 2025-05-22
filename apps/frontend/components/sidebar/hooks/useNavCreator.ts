import { Settings2 } from "lucide-react";
import { features } from "@/config/features";
import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";

export function useNavCreator(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name);
  const tNavbar = useTranslations("navbar");

  return [
    features.community.creator.enabled && {
      title: tNavbar("creator"),
      url: `/${slug}/creator`,
      icon: Settings2,
      items: [
        features.community.creator.settings && {
          title: tNavbar("settings"),
          url: `/${slug}/creator/settings`,
        },
        features.community.creator.members && {
          title: tNavbar("members"),
          url: `/${slug}/creator/members`,
        },
        features.community.creator.invite && {
          title: tNavbar("invite"),
          url: `/${slug}/creator/invite`,
        },
        features.community.creator.pricing && {
          title: tNavbar("pricing"),
          url: `/${slug}/creator/pricing`,
        },
        features.community.creator.moderation && {
          title: tNavbar("moderation"),
          url: `/${slug}/creator/moderation`,
        },
        features.community.creator.logs && {
          title: tNavbar("logs"),
          url: `/${slug}/creator/logs`,
        },
      ].filter(Boolean),
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
}
