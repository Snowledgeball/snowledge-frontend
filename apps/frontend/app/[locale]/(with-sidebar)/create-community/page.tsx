"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@repo/ui/components/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";

import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Switch } from "@repo/ui/components/switch";
import { Button } from "@repo/ui/components/button";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { features } from "@/config/features";
import { notFound } from "next/navigation";
import ModalInvite from "./ModalInvite";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit faire au moins 2 caractères." }),
  tags: z.string().optional(),
  isFree: z.boolean(),
  price: z.string().optional(),
  description: z.string().optional(),
  externalLinks: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

// Simulation d'un fetch de tags/types depuis une "base de données"
function useCommunityTypes() {
  return useQuery({
    queryKey: ["community-types"],
    queryFn: async () => {
      // Simule un appel API, à remplacer par un vrai fetch
      await new Promise((res) => setTimeout(res, 300));
      return [
        { value: "immobilier", label: "Immobilier" },
        { value: "bourse", label: "Bourse" },
        { value: "crypto", label: "Cryptomonnaies" },
        { value: "startups", label: "Startups" },
        { value: "crowdfunding", label: "Crowdfunding" },
        { value: "épargne", label: "Épargne" },
        { value: "or", label: "Or & métaux précieux" },
        { value: "nft", label: "NFT & actifs digitaux" },
      ];
    },
  });
}

export default function CreateCommunity() {
  if (!features.createCommunity.enabled) {
    notFound();
  }
  const [community, setCommunity] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [openInvite, setOpenInvite] = useState(false);
  const { data: communityTypes = [], isLoading: loadingTypes } =
    useCommunityTypes();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tags: "",
      isFree: true,
      price: "",
      description: "",
      externalLinks: "",
    },
  });
  const t = useTranslations("createCommunity");

  // Ajout de la mutation React Query
  const {
    mutate: createCommunity,
    isPending: isCreating,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data: FormSchema) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/communities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        let err;
        try {
          err = await res.json();
        } catch {
          err = { message: "Erreur inconnue" };
        }
        throw new Error(err.message || "Erreur lors de la création");
      }
      return res.json();
    },
    onSuccess: (data, variables) => {
      setCommunity(variables.name);
      setTimeout(() => setOpenInvite(true), 500);
    },
  });

  function onSubmit(values: FormSchema) {
    createCommunity(values);
  }

  return (
    <div className="min-h-screen flex mt-6 justify-center">
      <div className="max-w-xl w-full mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
        {/* Affichage des erreurs de création */}
        {isError && (
          <div className="text-red-500 mb-2">
            {(error as Error)?.message || "Erreur lors de la création"}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("name.placeholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("name.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormLabel>{t("isFree.label")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setIsFree(checked);
                      }}
                    />
                  </FormControl>
                  <FormDescription>{t("isFree.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isFree && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("price.label")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("price.placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t("price.description")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tags.label")}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={loadingTypes}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("tags.placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="z-50" position="popper">
                        <SelectGroup>
                          <SelectLabel>{t("tags.groupLabel")}</SelectLabel>
                          {communityTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>{t("tags.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description.label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("description.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("description.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("externalLinks.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("externalLinks.placeholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("externalLinks.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? t("loading") : t("submit")}
            </Button>
          </form>
        </Form>
        <ModalInvite
          open={openInvite}
          onOpenChange={setOpenInvite}
          communityUrl={`${window.location.origin}/community/${community}`}
        />
      </div>
    </div>
  );
}
