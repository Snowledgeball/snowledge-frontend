"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { Button } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { RadioGroup, RadioGroupItem } from "@repo/ui";
import { Textarea } from "@repo/ui";
import { MultiSelect } from "./multi-select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CommunityMembershipType } from "./CommunityMembershipType";
import { CommunityRevenueDistribution } from "./CommunityRevenueDistribution";

// Composant d'affichage d'erreur sous un champ
function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-red-500 mt-1">{error}</p>;
}

// Schéma de validation zod
const formSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Le nom doit faire au moins 2 caractères." }),
    tags: z
      .array(z.string())
      .min(1, { message: "Veuillez sélectionner au moins un tag." }),
    communityType: z.enum(["free", "paid"], {
      required_error: "Veuillez choisir un type d'adhésion.",
    }),
    price: z.string().optional(),
    yourPercentage: z.string().optional(),
    communityPercentage: z.string().optional(),
    description: z
      .string()
      .min(1, { message: "Veuillez ajouter une description." }),
    codeOfConduct: z
      .string()
      .min(1, { message: "Veuillez renseigner un code de conduite." }),
  })
  .superRefine((data, ctx) => {
    if (data.communityType === "paid") {
      if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message:
            "Le prix doit être strictement supérieur à 0 pour une communauté payante.",
        });
      }
      // Validation du total des pourcentages
      const your = Number(data.yourPercentage) || 0;
      const comm = Number(data.communityPercentage) || 0;
      const snowledgePercentage = 15;
      const total = your + comm + snowledgePercentage;
      if (total !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["repartition"],
          message: "La somme des pourcentages doit faire exactement 100%.",
        });
      }
    }
  });

type FormSchema = z.infer<typeof formSchema>;

export default function CreateCommunity() {
  const t = useTranslations("createCommunityForm");
  const [communityType, setCommunityType] = useState("free");

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
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tags: [],
      communityType: "free",
      price: "0.00",
      yourPercentage: "70",
      communityPercentage: "15",
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

  // Soumission du formulaire
  function onSubmit(values: FormSchema) {
    // TODO: Remplacer par une mutation ou un appel API
    alert(JSON.stringify(values, null, 2));
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
              <div className="space-y-2">
                <Label>{t("membership.label")}</Label>
                <CommunityMembershipType
                  value={communityType}
                  onChange={handleCommunityTypeChange}
                  error={errors.communityType?.message}
                  t={t}
                />
              </div>

              {/* Si paid, afficher le prix et la répartition */}
              {communityType === "paid" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="price">{t("membership.priceLabel")}</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("membership.pricePlaceholder")}
                        className="pl-7"
                        {...register("price")}
                      />
                    </div>
                    <FormError error={errors.price?.message} />
                  </div>
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
              <div className="space-y-2">
                <Label htmlFor="description">{t("description.label")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("description.placeholder")}
                  className="resize-none"
                  rows={3}
                  {...register("description")}
                />
                <FormError error={errors.description?.message} />
              </div>

              {/* Code de conduite */}
              <div className="space-y-2">
                <Label htmlFor="codeOfConduct">
                  {t("codeOfConduct.label")}
                </Label>
                <Textarea
                  id="codeOfConduct"
                  placeholder={t("codeOfConduct.placeholder")}
                  className="resize-none"
                  rows={3}
                  {...register("codeOfConduct")}
                />
                <FormError error={errors.codeOfConduct?.message} />
                <p className="text-xs text-muted-foreground">
                  {t("codeOfConduct.help")}
                </p>
              </div>

              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full">
                  {t("submit")}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {t("footerHelp")}
                </p>
              </CardFooter>
            </form>
          </CardContent>
        </TooltipProvider>
      </Card>
    </div>
  );
}
