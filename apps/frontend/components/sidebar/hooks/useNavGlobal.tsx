import {
  Settings2,
  Users,
  UserRoundPlus,
  BarChart3,
  Link2,
  CheckSquare,
  Gift,
  SquareTerminal,
  Plus,
  PlusCircle,
  Loader2,
  Check,
} from "lucide-react";
import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";

export function useNavGlobal(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name);
  const tNavbar = useTranslations("navbar");

  return [
    // features.community.myCommunity.generalInformations &&
    {
      title: tNavbar("voting"),
      icon: SquareTerminal,
      items: [
        {
          title: tNavbar("create-topic"),
          url: `/${slug}/global/voting/create-topic`,
          icon: PlusCircle,
        },
        {
          title: tNavbar("in-progress"),
          url: `/${slug}/global/voting/in-progress`,
          icon: Loader2,
        },
        {
          title: tNavbar("done"),
          url: `/${slug}/global/voting/done`,
          icon: Check,
        },
      ],
    },
  ].filter(Boolean) as {
    title: string;
    url?: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
}
