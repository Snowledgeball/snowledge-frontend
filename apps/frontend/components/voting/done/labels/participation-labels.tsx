import { Flame } from "lucide-react";

export const PARTICIPATION_LABELS = {
  low: {
    label: "low",
    color: "bg-gray-400",
    icon: <Flame className="w-4 h-4 text-gray-400" />,
  },
  medium: {
    label: "medium",
    color: "bg-orange-400",
    icon: <Flame className="w-4 h-4 text-orange-400" />,
  },
  high: {
    label: "high",
    color: "bg-green-500",
    icon: <Flame className="w-4 h-4 text-green-500" />,
  },
} as const;
