import { CheckCircle, XCircle, Clock } from "lucide-react";

export const STATUS_LABELS = {
  in_progress: {
    label: "in_progress",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
  },
  accepted: {
    label: "accepted",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
  rejected: {
    label: "rejected",
    color: "bg-red-100 text-red-700",
    icon: <XCircle className="w-4 h-4 text-red-500" />,
  },
} as const;
