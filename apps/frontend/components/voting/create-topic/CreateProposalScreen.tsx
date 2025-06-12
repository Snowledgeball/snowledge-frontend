"use client";

import { Button } from "@repo/ui/components/button";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { voteSchema, VoteFormValues } from "./vote-schema";
import { useCreateProposal } from "./hooks/useCreateProposal";
import TitleField from "./fields/TitleField";
import DescriptionField from "./fields/DescriptionField";
import FormatField from "./fields/FormatField";
import CommentsField from "./fields/CommentsField";
import SwitchContributeur from "./fields/SwitchContributeur";

const CreateProposalScreen = ({ communitySlug }: { communitySlug: string }) => {
  const t = useTranslations("voting");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VoteFormValues>({
    resolver: zodResolver(voteSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      format: undefined,
      comments: undefined,
      isContributor: false,
    },
  });
  const format = watch("format");
  const isContributor = watch("isContributor");
  const createProposal = useCreateProposal(communitySlug);

  const onSubmit = async (data: VoteFormValues) => {
    createProposal.mutate(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <header className="pt-4 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
          <h1 className="text-2xl font-bold">{t("create_subject_title")}</h1>
        </div>
        <p className="text-muted-foreground max-w-xl">
          {t("create_subject_description")}
        </p>
      </header>
      <form
        className="w-full flex flex-col gap-6 px-0 md:px-8 py-8"
        onSubmit={handleSubmit(onSubmit)}
        aria-label={t("create_subject_aria_label")}
      >
        <h2 className="text-2xl font-bold mb-2 text-center">
          {t("submit_subject")}
        </h2>
        <TitleField register={register} error={errors.title} t={t} />
        <DescriptionField
          register={register}
          error={errors.description}
          t={t}
        />
        <FormatField
          value={format}
          onChange={(v: string) => setValue("format", v)}
          error={errors.format}
          t={t}
        />
        <SwitchContributeur
          value={isContributor}
          onChange={(v: boolean) => setValue("isContributor", v)}
          t={t}
        />
        {/* <CommentsField register={register} error={errors.comments} t={t} />
        {createProposal.isError && (
          <div className="text-red-500 text-sm" role="alert">
            {t("vote_submitted_error")}
          </div>
        )} */}
        <Button
          type="submit"
          disabled={isSubmitting || createProposal.isPending}
          aria-disabled={isSubmitting || createProposal.isPending}
        >
          {isSubmitting || createProposal.isPending
            ? t("submitting")
            : t("submit")}
        </Button>
      </form>
    </section>
  );
};

export default CreateProposalScreen;
