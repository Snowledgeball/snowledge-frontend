import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schéma de validation du formulaire avec Zod
const feedbackFormSchema = z.object({
  email: z
    .string()
    .email("Adresse email invalide")
    .optional()
    .or(z.literal("")),
  feedback: z
    .string()
    .min(10, "Votre feedback doit comporter au moins 10 caractères")
    .max(1000, "Votre feedback ne doit pas dépasser 1000 caractères"),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] =
    useState<boolean>(false);
  const [images, setImages] = useState<File[]>([]);

  // Initialiser le formulaire avec react-hook-form et zod
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      email: "",
      feedback: "",
    },
  });

  const handleImagesChange = (files: File[]) => {
    setImages(files);
  };

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);

    try {
      // Création d'un FormData pour envoyer les images
      const formData = new FormData();
      formData.append("email", data.email || "");
      formData.append("feedback", data.feedback);

      // Ajouter chaque image au FormData
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        form.reset();
        setImages([]);
        setIsSuccessDialogOpen(true);
        toast.success("Feedback envoyé avec succès !");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Échec de l'envoi du feedback");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du feedback:", error);
      toast.error("Erreur lors de l'envoi du feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Donnez-nous votre avis</CardTitle>
          <CardDescription>
            Votre feedback nous aide à améliorer notre service. N'hésitez pas à
            joindre des captures d'écran.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre email (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemple.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Partagez votre email si vous souhaitez une réponse à votre
                      feedback
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Votre feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Partagez vos idées, suggestions ou problèmes rencontrés..."
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Captures d'écran (optionnel)</Label>
                <ImageUploader onImagesChange={handleImagesChange} />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer le feedback"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <AlertDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Merci pour votre feedback!</AlertDialogTitle>
            <AlertDialogDescription>
              Nous apprécions vraiment votre contribution. Votre avis nous
              aidera à améliorer notre plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessDialogOpen(false)}>
              Fermer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
