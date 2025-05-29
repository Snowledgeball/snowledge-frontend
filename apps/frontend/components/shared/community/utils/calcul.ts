//

// Utilitaires pour la gestion des formulaires de communauté
import { Community } from "@/types/community";
import { FormSchema } from "../hooks/useCommunityFormSchema";
import { useState } from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";

// Valeurs par défaut du formulaire (création)
export const defaultCommunityForm: FormSchema = {
  name: "",
  tags: [],
  communityType: "free",
  price: 0.0,
  yourPercentage: 70,
  communityPercentage: 15,
  description: "",
  codeOfConduct: "",
};

// Transforme une entité Community en valeurs pour le formulaire
export function communityToFormValues(
  community: Partial<Community> | null | undefined
): FormSchema {
  return {
    name: community?.name ?? "",
    tags: Array.isArray(community?.tags)
      ? (community!.tags as string[])
      : typeof community?.tags === "string" && community?.tags
        ? [community.tags as string]
        : [],
    communityType: community?.communityType ?? "free",
    price: community?.price ?? 0.0,
    yourPercentage: community?.yourPercentage ?? 70,
    communityPercentage: community?.communityPercentage ?? 15,
    description: community?.description ?? "",
    codeOfConduct: community?.codeOfConduct ?? "",
  };
}

// Helper pour la projection des valeurs du formulaire
export function getCommunityProjection(
  watch: UseFormWatch<FormSchema>,
  errors?: any
) {
  const price = Number(watch("price")) || 0;
  const yourPercentage = Number(watch("yourPercentage")) || 0;
  const communityPercentage = Number(watch("communityPercentage")) || 0;
  const snowledgePercentage = 15;
  const totalRepartition =
    yourPercentage + communityPercentage + snowledgePercentage;
  const repartitionError = errors?.repartition?.message ?? "";
  return {
    price,
    yourPercentage,
    communityPercentage,
    snowledgePercentage,
    totalRepartition,
    repartitionError,
  };
}
