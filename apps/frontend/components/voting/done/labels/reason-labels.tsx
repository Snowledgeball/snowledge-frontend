import { CheckCircle, Clock } from "lucide-react";

export const REASON_LABELS = {
  by_vote: {
    label: "by_vote",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
  by_expiration: {
    label: "by_expiration",
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
  },
} as const;
