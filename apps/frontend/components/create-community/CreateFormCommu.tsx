"use client";

import { useEffect, useState } from "react";
import { TooltipProvider } from "@repo/ui";
import { Button } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { CommunityMembershipType } from "./fields/CommunityMembershipType";
import { CommunityRevenueDistribution } from "./fields/CommunityRevenueDistribution";
import { CommunityDescriptionField } from "./fields/CommunityDescriptionField";
import { CommunityCodeOfConductField } from "./fields/CommunityCodeOfConductField";
import { CommunityPriceField } from "./fields/CommunityPriceField";
import { CreateCommunityFormFooter } from "./CreateCommunityFormFooter";

import ModalInvite from "./modals/ModalInvite";
import { MultiSelect } from "./ui/MultiSelect";

import { Community } from "@/types/general";

import {
  useCommunityFormSchema,
  FormSchema,
} from "./hooks/use-community-form-schema";
import { useCreateCommunity } from "./hooks/use-create-community";
import { useCurrentCommunity } from "@/hooks/use-current-community";

// Composant d'affichage d'erreur sous un champ
export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-red-500 mt-1">{error}</p>;
}

export default function CreateCommunity() {
  const t = useTranslations("createCommunityForm");
  const [communityType, setCommunityType] = useState("free");
  const [openInvite, setOpenInvite] = useState(false);
  const [community, setCommunity] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");

  const { setActiveCommunity } = useCurrentCommunity();

  const router = useRouter();
  const communityTags = [
    { label: "Tech", value: "technology" },
    { label: "Business", value: "business" },
    { label: "Finance", value: "finance" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
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
    mode: "onChange",
  });

  // Synchronisation du type d'adhésion
  const handleCommunityTypeChange = (value: string) => {
    setCommunityType(value);
    setValue("communityType", value as "free" | "paid");
  };

  // Synchronisation des tags (MultiSelect)
  const tags = watch("tags") || [];
  const selectedOptions = communityTags.filter((opt) =>
    tags.includes(opt.value)
  );

  // Pour la projection
  const price = Number(watch("price")) || 0;
  const yourPercentage = Number(watch("yourPercentage")) || 0;
  const communityPercentage = Number(watch("communityPercentage")) || 0;
  const snowledgePercentage = 15;

  const totalRepartition =
    yourPercentage + communityPercentage + snowledgePercentage;
  const repartitionError = (errors as any)["repartition"]?.message;

  const [pendingCommunity, setPendingCommunity] = useState<Community | null>(
    null
  );

  // Appel du hook useCreateCommunity
  const { mutate: createCommunity } = useCreateCommunity({
    onSuccess: (data, variables) => {
      setCommunity(variables.name);
      setOpenInvite(true);
      setPendingCommunity(data);
      setActiveCommunity(data);
    },
  });

  // Effet qui attend la fermeture de la modal
  useEffect(() => {
    if (!openInvite && pendingCommunity) {
      setTimeout(() => router.push(`/${pendingCommunity.slug}`), 500);
      setPendingCommunity(null); // Reset
    }
  }, [openInvite, pendingCommunity]);

  useEffect(() => {
    if (typeof window !== "undefined" && community) {
      setCommunityUrl(`${window.location.origin}/community/${community}`);
    }
  }, [community]);

  // Soumission du formulaire
  function onSubmit(values: FormSchema) {
    // On prépare un nouvel objet avec les conversions nécessaires
    const payload = {
      ...values,
      price: values.price ? Number(values.price) : undefined,
      yourPercentage: values.yourPercentage
        ? Number(values.yourPercentage)
        : undefined,
      communityPercentage: values.communityPercentage
        ? Number(values.communityPercentage)
        : undefined,
      user: 2, // TODO: get user id
    };

    console.log(JSON.stringify(payload));
    createCommunity(payload);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <CardDescription>{t("form-description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <TooltipProvider>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nom de la communauté */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("name.label")}</Label>
                <Input
                  id="name"
                  placeholder={t("name.placeholder")}
                  {...register("name")}
                />
                <FormError error={errors.name?.message} />
              </div>

              {/* Tags (MultiSelect) */}
              <div className="space-y-2">
                <Label htmlFor="tags">{t("tags.label")}</Label>
                <MultiSelect
                  options={communityTags}
                  value={selectedOptions}
                  onChange={(options) =>
                    setValue(
                      "tags",
                      options.map((opt) => opt.value),
                      { shouldValidate: true }
                    )
                  }
                  placeholder={t("tags.placeholder")}
                />
                <input type="hidden" {...register("tags")} value={tags} />
                <FormError error={errors.tags?.message} />
              </div>

              {/* Type d'adhésion (RadioGroup) */}
              <CommunityMembershipType
                value={communityType}
                onChange={handleCommunityTypeChange}
                error={errors.communityType?.message}
                t={t}
              />

              {/* Si paid, afficher le prix et la répartition */}
              {communityType === "paid" && (
                <>
                  <CommunityPriceField
                    register={register}
                    error={errors.price?.message}
                    t={t}
                    price={price}
                  />
                  <CommunityRevenueDistribution
                    price={price}
                    yourPercentage={yourPercentage}
                    communityPercentage={communityPercentage}
                    snowledgePercentage={snowledgePercentage}
                    errors={errors}
                    register={register}
                    t={t}
                    totalRepartition={totalRepartition}
                    repartitionError={repartitionError}
                  />
                </>
              )}

              {/* Description */}
              <CommunityDescriptionField
                register={register}
                error={errors.description?.message}
                t={t}
              />

              {/* Code de conduite */}
              <CommunityCodeOfConductField
                register={register}
                error={errors.codeOfConduct?.message}
                t={t}
              />

              <CreateCommunityFormFooter t={t} />
            </form>
          </CardContent>
        </TooltipProvider>
      </Card>
      <ModalInvite
        open={openInvite}
        onOpenChange={setOpenInvite}
        communityUrl={communityUrl}
      />
    </div>
  );
}
