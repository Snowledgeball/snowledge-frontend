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
import { Community } from "@/types/general";
import { useCommunityFormSchema } from "../shared/community/hooks/use-community-form-schema";
import { FormSchema } from "../shared/community/hooks/use-community-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const defaultForm = {
  name: "",
  tags: [],
  communityType: "free",
  price: 0.0,
  yourPercentage: 70,
  communityPercentage: 15,
};

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
  const {
    setValue,
    register,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(useCommunityFormSchema()),
    defaultValues: {
      name: "",
      tags: [],
      communityType: "free",
      price: 0.0,
      yourPercentage: 70,
      communityPercentage: 15,
      description: "",
      codeOfConduct: "",
    },
  });

  const [form, setForm] = useState({});
  const [communityType, setCommunityType] = useState("free");

  useEffect(() => {
    if (community) {
      reset({
        name: community.name ?? "",
        tags: Array.isArray(community.tags)
          ? community.tags
          : typeof community.tags === "string" && community.tags
            ? [community.tags]
            : [],
        communityType: community.communityType ?? "free",
        price: community.price ?? 0.0,
        yourPercentage: community.yourPercentage ?? 70,
        communityPercentage: community.communityPercentage ?? 15,
        description: community.description ?? "",
        codeOfConduct: community.codeOfConduct ?? "",
      });
      setCommunityType(community.communityType ?? "free");
    }
  }, [community, reset]);

  // Pour la projection
  const price = Number(watch("price")) || 0;
  const yourPercentage = Number(watch("yourPercentage")) || 0;
  const communityPercentage = Number(watch("communityPercentage")) || 0;
  const snowledgePercentage = 15;

  const totalRepartition =
    yourPercentage + communityPercentage + snowledgePercentage;
  const repartitionError = (errors as any)["repartition"]?.message;

  useEffect(() => {
    if (community) {
      setForm({
        community,
      });
    }
  }, [community]);

  const t = useTranslations("manageCommunity");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: call API
    console.log(form);
  }

  // Synchronisation du type d'adhésion
  const handleCommunityTypeChange = (value: string) => {
    setCommunityType(value);
    setValue("communityType", value as "free" | "paid");
  };

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
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                )}
                {features.community.creator.settings.access && (
                  <CommunityAccessSection
                    value={communityType}
                    onChange={handleCommunityTypeChange}
                    errors={errors}
                  />
                )}
                {features.community.creator.settings.gains &&
                  communityType === "paid" && (
                    <CommunityGainsSection
                      form={form}
                      errors={errors}
                      register={register}
                      totalRepartition={totalRepartition}
                      repartitionError={repartitionError}
                      snowledgePercentage={snowledgePercentage}
                      price={price}
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
