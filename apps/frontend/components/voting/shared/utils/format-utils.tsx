import { FileText, GraduationCap, BookOpen } from "lucide-react";
import React from "react";

export const getFormatIconAndLabel = (format?: string) => {
  if (!format) return null;
  switch (format.toLowerCase()) {
    case "masterclass":
      return {
        icon: <GraduationCap className="w-4 h-4 text-indigo-500" />,
        label: "Masterclass",
      };
    case "white paper":
    case "whitepaper":
      return {
        icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
        label: "White paper",
      };
    default:
      return {
        icon: <FileText className="w-4 h-4 text-muted-foreground" />,
        label: format.charAt(0).toUpperCase() + format.slice(1),
      };
  }
}; 