"use client";

import { Button } from "@repo/ui";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
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
  const params = useParams();
  const communitySlug = params?.slug as string;

  const {
    data: community,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["community", communitySlug],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities/${communitySlug}`
      );
      if (!res.ok)
        throw new Error("Erreur lors du chargement de la communauté");
      return res.json();
    },
    enabled: !!communitySlug,
  });

  const defaultForm = {
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
  };

  const [form, setForm] = useState(defaultForm);
  const [isFree, setIsFree] = useState(true);

  useEffect(() => {
    if (community) {
      setForm({
        ...defaultForm,
        ...community,
        adminShare: community.adminShare ?? defaultForm.adminShare,
        platformShare: community.platformShare ?? defaultForm.platformShare,
        prizePoolShare: community.prizePoolShare ?? defaultForm.prizePoolShare,
        prizeCreation: community.prizeCreation ?? defaultForm.prizeCreation,
        prizeRevision: community.prizeRevision ?? defaultForm.prizeRevision,
        prizeAnimation: community.prizeAnimation ?? defaultForm.prizeAnimation,
        prizeSharing: community.prizeSharing ?? defaultForm.prizeSharing,
      });
      setIsFree(community.isFree ?? true);
    }
  }, [community]);

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

  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur lors du chargement</div>;

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
