"use client";

import { Button } from "@repo/ui";
import { useTranslations } from "next-intl";

import { useState } from "react";
import { CommunityHeader } from "./community-header";
import { CommunityGeneralSection } from "./community-general-section";
import { CommunityAccessSection } from "./community-access-section";
import { CommunityGainsSection } from "./community-gains-section";

import { features } from "@/config/features";

const communityTypes = [
  { value: "immobilier", label: "Immobilier" },
  { value: "bourse", label: "Bourse" },
  { value: "crypto", label: "Cryptomonnaies" },
  { value: "startups", label: "Startups" },
  { value: "crowdfunding", label: "Crowdfunding" },
  { value: "épargne", label: "Épargne" },
  { value: "or", label: "Or & métaux précieux" },
  { value: "nft", label: "NFT & actifs digitaux" },
];

export function CommunityManager() {
  const [isFree, setIsFree] = useState(true);
  const [form, setForm] = useState({
    name: "Ma communauté",
    tags: "",
    description: "",
    externalLinks: "",
    isFree: true,
    price: "",
    adminShare: "60",
    platformShare: "20",
    prizePoolShare: "20",
    prizeCreation: "40",
    prizeRevision: "20",
    prizeAnimation: "20",
    prizeSharing: "20",
  });

  const t = useTranslations("manageCommunity");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked;
      if (name === "isFree") setIsFree(e.target.checked);
    }
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  function handleSelect(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: call API
    console.log(form);
  }

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader />
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row">
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-0 py-4 md:py-6 md:pl-6">
              <form onSubmit={handleSubmit}>
                {features.community.creator.settings.general && (
                  <CommunityGeneralSection
                    form={form}
                    handleChange={handleChange}
                    handleSelect={handleSelect}
                    communityTypes={communityTypes}
                  />
                )}
                {features.community.creator.settings.access && (
                  <CommunityAccessSection
                    isFree={isFree}
                    form={form}
                    handleChange={handleChange}
                    setIsFree={setIsFree}
                  />
                )}
                {features.community.creator.settings.gains && (
                  <CommunityGainsSection
                    form={form}
                    handleChange={handleChange}
                  />
                )}
                <div className="flex justify-end">
                  <Button type="submit">{t("save")}</Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
