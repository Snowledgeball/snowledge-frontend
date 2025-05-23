import { z } from "zod";

export const formSchema = z
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

export type FormSchema = z.infer<typeof formSchema>;
