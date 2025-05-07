"use client";

import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CommunityTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isContributor: boolean;
  isCreator: boolean;
  pendingPostsCount: number;
  pendingEnrichmentsCount: number;
}

export default function CommunityTabs({
  activeTab,
  setActiveTab,
  pendingPostsCount,
  pendingEnrichmentsCount,
}: CommunityTabsProps) {
  const { t } = useTranslation("translation");

  return (
    <div className="border-b border-gray-200 mb-6" id="community-tabs">
      <nav className="-mb-px flex justify-center space-x-8">
        <button
          className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("general")}
          aria-controls="general-section"
          aria-selected={activeTab === "general"}
          role="tab"
          id="tab-general"
        >
          {t("community_tabs.general")}
        </button>
        <button
          className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors ${
            activeTab === "posts"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("posts")}
          aria-controls="posts-section"
          aria-selected={activeTab === "posts"}
          role="tab"
          id="tab-posts"
        >
          {t("community_tabs.threads")}
        </button>
        {/* Bouton Masterclass verrouillé */}
        <button
          onClick={() =>
            toast.info(t("community_tabs.masterclass_not_available"))
          }
          className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors opacity-60 cursor-not-allowed flex items-center gap-2
            ${
              activeTab === "masterclass"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
          aria-disabled="true"
          id="tab-masterclass"
        >
          {t("community_tabs.masterclass")}
          <Lock className="w-4 h-4" />
        </button>
        {/* Bouton Cours verrouillé */}
        <button
          onClick={() => toast.info(t("community_tabs.courses_not_available"))}
          className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors opacity-60 cursor-not-allowed flex items-center gap-2
            ${
              activeTab === "courses"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
          aria-disabled="true"
          id="tab-courses"
        >
          {t("community_tabs.courses")}
          <Lock className="w-4 h-4" />
        </button>
        <button
          className={`border-b-2 py-4 px-6 text-sm font-medium transition-colors flex items-center ${
            activeTab === "voting"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
          onClick={() => setActiveTab("voting")}
          aria-controls="voting-section"
          aria-selected={activeTab === "voting"}
          role="tab"
          id="tab-voting"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {t("community_tabs.votes_contributions")}
          {(pendingPostsCount > 0 || pendingEnrichmentsCount > 0) && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
              {pendingPostsCount + pendingEnrichmentsCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
