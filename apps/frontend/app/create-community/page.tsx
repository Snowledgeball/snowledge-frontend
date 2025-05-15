"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Switch,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "ui";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit faire au moins 2 caractères." }),
  tags: z.string().optional(),
  isFree: z.boolean(),
  price: z.string().optional(),
  description: z.string().optional(),
  externalLinks: z.string().optional(),
  gainParams: z.string().optional(),
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
        { value: "sport", label: "Sport" },
        { value: "musique", label: "Musique" },
        { value: "tech", label: "Tech" },
        { value: "art", label: "Art" },
        { value: "voyage", label: "Voyage" },
      ];
    },
  });
}

export default function CreateCommunity() {
  const [isFree, setIsFree] = useState(true);
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
      gainParams: "",
    },
  });

  function onSubmit(values: FormSchema) {
    console.log(values);
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Créer une communauté</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de la communauté" {...field} />
                </FormControl>
                <FormDescription>Le nom de votre communauté.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Gratuit</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setIsFree(checked);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Activez pour rendre la communauté gratuite. Désactivez pour
                  indiquer un prix.
                </FormDescription>
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
                  <FormLabel>Prix</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Prix en €"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Prix d&apos;accès à la communauté.
                  </FormDescription>
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
                <FormLabel>Type / Tags</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loadingTypes}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisissez un type" />
                    </SelectTrigger>
                    <SelectContent className="z-50" position="popper">
                      <SelectGroup>
                        <SelectLabel>Types</SelectLabel>
                        {communityTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Sélectionnez le type principal de la communauté.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez votre communauté..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Une description pour présenter la communauté.
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
                <FormLabel>Liens externes</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormDescription>
                  Ajoutez un ou plusieurs liens externes (séparés par des
                  virgules).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gainParams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paramètre de gains</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: % de commission, bonus..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Définissez les paramètres de gains éventuels.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Créer la communauté
          </Button>

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>
      </Form>
    </div>
  );
}
