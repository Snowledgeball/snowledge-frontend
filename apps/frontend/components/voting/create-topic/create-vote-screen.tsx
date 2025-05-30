"use client";

import { useState } from "react";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

// ============
// Function: CreateVoteScreen
// ------------
// DESCRIPTION: Displays a form for users to propose a voting subject with title, description, format, comments, and submit button. Handles validation and feedback.
// PARAMS: None
// RETURNS: JSX.Element (the voting creation form UI)
// ============
const CreateVoteScreen = () => {
  const t = useTranslations("voting");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isContributor, setIsContributor] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTitle("");
      setDescription("");
      setFormat("");
      setComments("");
    }, 1200);
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <header className="pt-4 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold">{t("create_vote_title")}</h1>
        </div>
        <p className="text-muted-foreground max-w-xl">
          {t("create_vote_description")}
        </p>
      </header>
      <form
        className="w-full flex flex-col gap-6 px-0 md:px-8 py-8"
        onSubmit={handleSubmit}
        aria-label={t("create_vote_aria_label")}
      >
        <h2 className="text-2xl font-bold mb-2 text-center">
          {t("submit_subject")}
        </h2>
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">
            {t("title_label")} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("title_placeholder")}
            required
            aria-required="true"
            aria-label={t("vote_title")}
            tabIndex={0}
            maxLength={80}
            className=""
          />
          <span className="text-xs text-muted-foreground">
            {t("max_80_characters")}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">
            {t("description_label")} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("description_placeholder")}
            required
            aria-required="true"
            aria-label={t("vote_description")}
            tabIndex={0}
            maxLength={200}
            className="min-h-[60px]"
          />
          <span className="text-xs text-muted-foreground">
            {t("max_200_characters")}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="format">{t("format_label")}</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger id="format" aria-label={t("format_label")}>
              <SelectValue placeholder={t("format_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masterclass">{t("masterclass")}</SelectItem>
              <SelectItem value="whitepaper">{t("white_paper")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="contributor"
            checked={isContributor}
            onCheckedChange={setIsContributor}
            aria-label={t("i_want_to_be_contributor")}
          />
          <Label htmlFor="contributor" className="cursor-pointer select-none">
            {t("i_want_to_be_contributor")}
          </Label>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="comments">{t("comments_label")}</Label>
          <Textarea
            id="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={t("comments_placeholder")}
            aria-label={t("comments_label")}
            tabIndex={0}
            maxLength={400}
            className="min-h-[80px]"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {t(error)}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm" role="status">
            {t("vote_submitted_success")}
          </div>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim() || !description.trim()}
          aria-disabled={isSubmitting || !title.trim() || !description.trim()}
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </section>
  );
};

export default CreateVoteScreen;
