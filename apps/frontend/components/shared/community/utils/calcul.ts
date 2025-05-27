//

// Utilitaires pour la gestion des formulaires de communauté
import { Community } from "@/types/general";
import { FormSchema } from "../hooks/use-community-form-schema";

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
