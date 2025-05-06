"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

interface ProposalFormProps {
  onSubmit: (
    title: string,
    description: string,
    willContribute: boolean
  ) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProposalForm({
  onSubmit,
  isOpen,
  onOpenChange,
}: ProposalFormProps) {
  const { t } = useTranslation();
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
  });
  const [willContribute, setWillContribute] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposal.title || !newProposal.description) return;

    setIsSubmitting(true);
    try {
      await onSubmit(
        newProposal.title,
        newProposal.description,
        willContribute
      );
      // Réinitialiser le formulaire
      setNewProposal({ title: "", description: "" });
      setWillContribute(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button className="border border-dashed border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
          {t("voting.propose_topic")}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-[500px] bg-white">
        <SheetHeader>
          <SheetTitle>{t("voting.propose_new_topic")}</SheetTitle>
          <SheetDescription>{t("voting.fill_form_topic")}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t("voting.title")}
              </Label>
              <Input
                id="title"
                value={newProposal.title}
                onChange={(e) =>
                  setNewProposal((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right self-start">
                {t("voting.description")}
              </Label>
              <Textarea
                id="description"
                value={newProposal.description}
                onChange={(e) =>
                  setNewProposal((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="col-span-3 min-h-[200px]"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="contribute-new"
                checked={willContribute}
                onCheckedChange={setWillContribute}
              />
              <Label htmlFor="contribute-new" className="text-sm text-gray-700">
                {t("voting.want_to_contribute")}
              </Label>
            </div>
          </div>
          <SheetFooter className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between w-full">
            <div className="flex space-x-2 sm:justify-end">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  {t("actions.cancel")}
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("loading.default")
                  : t("voting.submit_proposal")}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
