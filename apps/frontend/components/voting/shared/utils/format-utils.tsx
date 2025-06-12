import { FileText, GraduationCap, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

export const getFormatIconAndLabel = (format?: string) => {
  const t = useTranslations("voting");
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
    case "tobedefined":
    case "to be defined":
      return {
        icon: <FileText className="w-4 h-4 text-muted-foreground" />,
        label: t("to_be_defined"),
      };
    default:
      return {
        icon: <FileText className="w-4 h-4 text-muted-foreground" />,
        label: format.charAt(0).toUpperCase() + format.slice(1),
      };
  }
};
