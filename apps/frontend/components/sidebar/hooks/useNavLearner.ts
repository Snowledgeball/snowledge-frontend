import {
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
  SquareTerminal,
  AudioWaveform,
  LucideIcon,
} from "lucide-react";

import { features } from "@/config/features";
import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";

export function useNavLearner(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name || "");
  const tNavbar = useTranslations("navbar");

  return [
    features.community.learner.dashboard.enabled && {
      title: tNavbar("dashboard"),
      url: `/${slug}/learner/dashboard`,
      icon: PieChart,
      items: [
        features.community.learner.dashboard.overview && {
          title: tNavbar("overview"),
          url: `/${slug}/learner/dashboard/overview`,
        },
        features.community.learner.dashboard.details && {
          title: tNavbar("details"),
          url: `/${slug}/learner/dashboard/details`,
        },
      ].filter(Boolean),
    },
    features.community.learner.content.enabled && {
      title: tNavbar("content"),
      url: `/${slug}/learner/content`,
      icon: BookOpen,
      items: [
        features.community.learner.content.articles && {
          title: tNavbar("articles"),
          url: `/${slug}/learner/content/articles`,
        },
        features.community.learner.content.videos && {
          title: tNavbar("videos"),
          url: `/${slug}/learner/content/videos`,
        },
        features.community.learner.content.podcasts && {
          title: tNavbar("podcasts"),
          url: `/${slug}/learner/content/podcasts`,
        },
      ].filter(Boolean),
    },
    features.community.learner.discussions.enabled && {
      title: tNavbar("discussions"),
      url: `/${slug}/learner/discussions`,
      icon: Bot,
      items: [
        features.community.learner.discussions.forum && {
          title: tNavbar("forum"),
          url: `/${slug}/learner/discussions/forum`,
        },
        features.community.learner.discussions.chat && {
          title: tNavbar("chat"),
          url: `/${slug}/learner/discussions/chat`,
        },
      ].filter(Boolean),
    },
    features.community.learner.resources.enabled && {
      title: tNavbar("resources"),
      url: `/${slug}/learner/resources`,
      icon: BookOpen,
      items: [
        features.community.learner.resources.documents && {
          title: tNavbar("documents"),
          url: `/${slug}/learner/resources/documents`,
        },
        features.community.learner.resources.links && {
          title: tNavbar("links"),
          url: `/${slug}/learner/resources/links`,
        },
      ].filter(Boolean),
    },
    features.community.learner.ideas.enabled && {
      title: tNavbar("ideas"),
      url: `/${slug}/learner/ideas`,
      icon: SquareTerminal,
      items: [
        features.community.learner.ideas.propose && {
          title: tNavbar("propose"),
          url: `/${slug}/learner/ideas/propose`,
        },
        features.community.learner.ideas.myIdeas && {
          title: tNavbar("my-ideas"),
          url: `/${slug}/learner/ideas/my-ideas`,
        },
      ].filter(Boolean),
    },
    features.community.learner.calendar.enabled && {
      title: tNavbar("calendar"),
      url: `/${slug}/learner/calendar`,
      icon: Frame,
      items: [
        features.community.learner.calendar.events && {
          title: tNavbar("events"),
          url: `/${slug}/learner/calendar/events`,
        },
        features.community.learner.calendar.myEvents && {
          title: tNavbar("my-events"),
          url: `/${slug}/learner/calendar/my-events`,
        },
      ].filter(Boolean),
    },
    features.community.learner.notifications.enabled && {
      title: tNavbar("notifications"),
      url: `/${slug}/learner/notifications`,
      icon: Command,
    },
    features.community.learner.faq && {
      title: tNavbar("faq"),
      url: `/${slug}/learner/faq`,
      icon: GalleryVerticalEnd,
    },
    features.community.learner.support.enabled && {
      title: tNavbar("support"),
      url: `/${slug}/learner/support`,
      icon: AudioWaveform,
    },
  ].filter(Boolean) as {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
}
