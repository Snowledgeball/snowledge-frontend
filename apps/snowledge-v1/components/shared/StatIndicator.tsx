import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface StatIndicatorProps {
  type: string;
  value: number;
  icon: ReactNode;
  valueClassName?: string;
  noBorder?: boolean;
}

export function StatIndicator({
  type,
  value,
  icon,
  valueClassName = "text-gray-900",
  noBorder = false,
}: StatIndicatorProps) {
  const { i18n } = useTranslation();

  const formattedValue =
    type === "points"
      ? value.toLocaleString(i18n.language || "fr-FR")
      : value.toFixed(2);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1 ${
        !noBorder ? "border-r border-gray-200" : ""
      }`}
    >
      {icon}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{type.toUpperCase()}</span>
        <span className={`font-bold text-sm ${valueClassName}`}>
          {formattedValue}
        </span>
      </div>
    </div>
  );
}
