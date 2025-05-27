"use client";

import { Button } from "@repo/ui";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { CommunityHeader } from "./CommunityHeader";
import { CommunityGeneralSection } from "./CommunityGeneralSection";
import { CommunityAccessSection } from "./CommunityAccessSection";
import { CommunityGainsSection } from "./CommunityGainsSection";
import { features } from "@/config/features";
import { useCommunityFormSchema } from "../shared/community/hooks/use-community-form-schema";
import { FormSchema } from "../shared/community/hooks/use-community-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrentCommunity } from "@/hooks/use-current-community";
import { Community } from "@/types/general";
import { useUpdateCommunity } from "./hooks/use-update-community";
import {
  defaultCommunityForm,
  communityToFormValues,
} from "../shared/community/utils/calcul";

export function CommunityManager() {
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const {
    setActiveCommunity,
    activeCommunity,
  }: {
    setActiveCommunity: (community: Community) => void;
    activeCommunity: Community | null;
  } = useCurrentCommunity();

  useEffect(() => {
    if (activeCommunity) {
      console.log("activeCommunity", activeCommunity);
      setCommunity(activeCommunity);
    }
  }, [activeCommunity]);

  const { mutate: updateCommunity } = useUpdateCommunity(community?.id ?? 0, {
    onSuccess: (data) => {
      setTimeout(() => {
        setActiveCommunity(data);
        router.push(`/${data.slug}`);
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    setValue,
    register,
    watch,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<FormSchema>({
    resolver: zodResolver(useCommunityFormSchema()),
    defaultValues: defaultCommunityForm,
  });

  const [communityType, setCommunityType] = useState("free");

  useEffect(() => {
    if (community) {
      reset(communityToFormValues(community));
      setCommunityType(community.communityType ?? "free");
    }
  }, [community, reset]);

  const t = useTranslations("manageCommunity");

  function onSubmit(values: FormSchema) {
    updateCommunity(values);
  }

  // Synchronisation du type d'adhésion
  const handleCommunityTypeChange = (value: string) => {
    setCommunityType(value);
    setValue("communityType", value as "free" | "paid");
  };

  // Calculs pour CommunityGainsSection (directement dans le composant, pas dans un useState)
  const price = Number(watch("price")) || 0;
  const yourPercentage = Number(watch("yourPercentage")) || 0;
  const communityPercentage = Number(watch("communityPercentage")) || 0;
  const snowledgePercentage = 15;
  const totalRepartition =
    yourPercentage + communityPercentage + snowledgePercentage;
  const repartitionError = (errors as any)["repartition"]?.message;

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader />
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row">
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-0 py-4 md:py-6 md:pl-6">
              <form onSubmit={handleSubmit(onSubmit)}>
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
                      errors={errors}
                      register={register}
                      totalRepartition={totalRepartition}
                      repartitionError={repartitionError}
                      snowledgePercentage={snowledgePercentage}
                      price={price}
                      yourPercentage={yourPercentage}
                      communityPercentage={communityPercentage}
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
