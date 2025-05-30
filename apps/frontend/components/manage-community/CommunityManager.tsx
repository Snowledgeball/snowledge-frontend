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
import { useCommunityFormSchema } from "../shared/community/hooks/useCommunityFormSchema";
import { FormSchema } from "../shared/community/hooks/useCommunityFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { Community } from "@/types/community";
import { useUpdateCommunity } from "./hooks/useUpdateCommunity";
import {
  defaultCommunityForm,
  communityToFormValues,
  getCommunityProjection,
} from "../shared/community/utils/calcul";
import { useCommunityType } from "../shared/community/hooks/useCommunityType";

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

  const [communityType, handleCommunityTypeChange] = useCommunityType(
    watch,
    setValue
  );
  const {
    price,
    yourPercentage,
    communityPercentage,
    snowledgePercentage,
    totalRepartition,
    repartitionError,
  } = getCommunityProjection(watch, errors);

  const t = useTranslations("communityForm.manage");

  useEffect(() => {
    if (community) {
      reset(communityToFormValues(community));
    }
  }, [community, reset]);

  function onSubmit(values: FormSchema) {
    updateCommunity(values);
  }

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader />
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row">
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-0 py-4 md:py-6 md:pl-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                {features.community.myCommunity.generalInformations && (
                  <CommunityGeneralSection
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                )}
                {features.community.myCommunity.integrations && (
                  <CommunityAccessSection
                    value={communityType}
                    onChange={
                      handleCommunityTypeChange as (value: string) => void
                    }
                    errors={errors}
                  />
                )}
                {features.community.myCommunity.rewards &&
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
