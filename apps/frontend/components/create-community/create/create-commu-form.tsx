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
    }
  });

type FormSchema = z.infer<typeof formSchema>;

export default function CreateCommunity() {
  const t = useTranslations("createCommunityForm");
  const [communityType, setCommunityType] = useState("free");
  const [selectedTags, setSelectedTags] = useState<
    { label: string; value: string }[]
  >([]);

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

  useEffect(() => {
    setValue(
      "tags",
      selectedTags.map((opt) => opt.value),
      { shouldValidate: true }
    );
  }, [selectedTags, setValue]);

  // Synchronisation du type d'adhésion
  const handleCommunityTypeChange = (value: string) => {
    setCommunityType(value);
    setValue("communityType", value as "free" | "paid");
  };

  // Synchronisation des tags (MultiSelect)
  const tags = watch("tags");

  // Pour la projection
  const price = Number(watch("price")) || 0;
  const yourPercentage = Number(watch("yourPercentage")) || 0;
  const communityPercentage = Number(watch("communityPercentage")) || 0;
  const snowledgePercentage = 15;

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
                  defaultValue={communityTags.filter((opt) =>
                    tags?.includes(opt.value)
                  )}
                  onChange={setSelectedTags}
                  placeholder={t("tags.placeholder")}
                />
                <input type="hidden" {...register("tags")} value={tags} />
                <FormError error={errors.tags?.message} />
              </div>

              {/* Type d'adhésion (RadioGroup) */}
              <div className="space-y-2">
                <Label>{t("membership.label")}</Label>
                <RadioGroup
                  value={communityType}
                  onValueChange={handleCommunityTypeChange}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free" className="font-normal">
                      {t("membership.free")}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("membership.freeTooltip")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label htmlFor="paid" className="font-normal">
                      {t("membership.paid")}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("membership.paidTooltip")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </RadioGroup>
                <FormError error={errors.communityType?.message} />
              </div>

              {/* Si paid, afficher le prix et la répartition */}
              {communityType === "paid" && (
                <div className="space-y-4">
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

                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium">
                      {t("membership.revenueTitle")}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="your-percentage">
                          {t("membership.yourLabel")}
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="your-percentage"
                              type="number"
                              min="0"
                              max="85"
                              className="pr-8"
                              {...register("yourPercentage")}
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                              %
                            </span>
                          </div>
                          <div className="w-20 px-3 py-2 bg-background border rounded-md text-sm text-muted-foreground">
                            <span>
                              {price && yourPercentage
                                ? `$${((price * yourPercentage) / 100).toFixed(2)}`
                                : "$0.00"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="community-percentage">
                            {t("membership.communityLabel")}
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("membership.communityTooltip")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="community-percentage"
                              type="number"
                              min="0"
                              max="85"
                              className="pr-8"
                              {...register("communityPercentage")}
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                              %
                            </span>
                          </div>
                          <div className="w-20 px-3 py-2 bg-background border rounded-md text-sm text-muted-foreground">
                            <span>
                              {price && communityPercentage
                                ? `$${((price * communityPercentage) / 100).toFixed(2)}`
                                : "$0.00"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="snowledge-percentage">
                          {t("membership.snowledgeLabel")}
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="snowledge-percentage"
                              type="number"
                              value={snowledgePercentage}
                              readOnly
                              className="pr-8 bg-muted"
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                              %
                            </span>
                          </div>
                          <div className="w-20 px-3 py-2 bg-muted border rounded-md text-sm text-muted-foreground">
                            <span>
                              {price
                                ? `$${((price * snowledgePercentage) / 100).toFixed(2)}`
                                : "$0.00"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("membership.platformFee")}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>{t("membership.total")}</span>
                        <span className="font-medium">100%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("membership.editableHint")}
                      </p>
                    </div>
                  </div>
                </div>
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
