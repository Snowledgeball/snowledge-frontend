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
    price: z.any(), // On laisse en any pour laisser passer la valeur, puis la valider dans .superRefine avec le message personnalisé.
    yourPercentage: z.any(), // On laisse en any pour laisser passer la valeur, puis la valider dans .superRefine avec le message personnalisé.
    communityPercentage: z.any(), // On laisse en any pour laisser passer la valeur, puis la valider dans .superRefine avec le message personnalisé.
    description: z
      .string()
      .min(1, { message: "Veuillez ajouter une description." }),
    codeOfConduct: z
      .string()
      .min(1, { message: "Veuillez renseigner un code de conduite." }),
  })
  .superRefine((data, ctx) => {
    if (data.communityType === "paid") {
      const valPrice = Number(data.price);
      if (!data.price || isNaN(valPrice) || valPrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message:
            "Le prix doit être strictement supérieur à 0 pour une communauté payante.",
        });
      }
      const val = Number(data.yourPercentage);
      if (!data.yourPercentage || isNaN(val) || val <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["yourPercentage"],
          message: "Veuillez renseigner votre pourcentage.",
        });
      }
      const valCommunity = Number(data.communityPercentage);
      if (
        !data.communityPercentage ||
        isNaN(valCommunity) ||
        valCommunity <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["communityPercentage"],
          message: "Veuillez renseigner le pourcentage de la communauté.",
        });
      }
      if (
        typeof data.yourPercentage === "number" &&
        typeof data.communityPercentage === "number" &&
        !isNaN(data.yourPercentage) &&
        !isNaN(data.communityPercentage)
      ) {
        const snowledgePercentage = 15;
        const total =
          data.yourPercentage + data.communityPercentage + snowledgePercentage;
        if (total !== 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["repartition"],
            message: "La somme des pourcentages doit faire exactement 100%.",
          });
        }
      }
    }
  });

export type FormSchema = z.infer<typeof formSchema>;
