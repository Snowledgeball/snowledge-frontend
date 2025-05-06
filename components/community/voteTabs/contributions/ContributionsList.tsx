"use client";

import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Contribution } from "../common/types";
import { truncateAndSanitize } from "../common/utils";

interface ContributionsListProps {
  contributions: Contribution[];
  selectedContribution: Contribution | null;
  onSelectContribution: (contribution: Contribution) => void;
  isLoading: boolean;
}

export function ContributionsList({
  contributions,
  selectedContribution,
  onSelectContribution,
  isLoading,
}: ContributionsListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 flex-1">
        <p className="text-gray-500">{t("loading.default")}</p>
      </div>
    );
  }

  if (!contributions || contributions.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 flex-1">
        <p className="text-gray-500">{t("voting.no_contributions")}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-2">
        {contributions.map((contribution) => (
          <div
            key={contribution?.id || Math.random()}
            onClick={() => contribution && onSelectContribution(contribution)}
            className={`rounded-md cursor-pointer overflow-hidden mb-2 border ${
              selectedContribution?.id === contribution?.id
                ? contribution?.tag === "creation"
                  ? "bg-purple-100 border-purple-300"
                  : "bg-blue-100 border-blue-300"
                : contribution?.tag === "creation"
                ? "border-l-4 border-l-purple-500 border-gray-200 bg-white"
                : "border-l-4 border-l-blue-500 border-gray-200 bg-white"
            } hover:shadow-sm transition-all`}
          >
            {/* Section du contenu principal */}
            <div className="p-3">
              {/* Badge d'étiquette */}
              <div className="flex justify-between items-center mb-1.5">
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    contribution.tag === "creation"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {contribution.tag === "creation"
                    ? t("voting.creation")
                    : t("voting.enrichment")}
                </span>
              </div>

              {/* Titre avec troncature */}
              <h3 className="font-medium text-gray-800 text-sm sm:text-base mb-1">
                {truncateAndSanitize(contribution.title || "", 28)}
              </h3>

              {/* Contenu avec troncature */}
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {truncateAndSanitize(contribution.content || "", 35)}
              </p>
            </div>

            {/* Section de pied pour l'auteur */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5 flex-shrink-0">
                  <AvatarImage src={contribution.user.profilePicture} />
                  <AvatarFallback>
                    {truncateAndSanitize(contribution?.user?.fullName || "", 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-600">
                  {truncateAndSanitize(contribution?.user?.fullName || "", 15)}
                </span>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                {format(
                  new Date(contribution?.created_at || new Date()),
                  "dd/MM/yy",
                  { locale: fr }
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
