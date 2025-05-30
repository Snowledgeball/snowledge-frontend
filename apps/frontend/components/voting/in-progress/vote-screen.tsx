import { Button } from "@repo/ui/components/button";
import type { Proposal } from "@/types/proposal";
import { useTranslations, useLocale } from "next-intl";
import { fr, enUS } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { voteSchema, VoteFormValues } from "./vote-schema";
import { useVote } from "./useVote";
import { useAuth } from "@/contexts/auth-context";
import ProposalHeader from "./fields/ProposalHeader";
import VoteSubjectBlock from "./fields/VoteSubjectBlock";
import VoteFormatBlock from "./fields/VoteFormatBlock";

function VoteScreen({
  proposal,
  onBack,
}: {
  proposal: Proposal;
  onBack?: () => void;
}) {
  const t = useTranslations("voting");
  const locale = useLocale();
  const dateFnsLocale = locale === "fr" ? fr : enUS;
  const { user } = useAuth();
  const voteMutation = useVote();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
    setValue,
    watch,
  } = useForm<VoteFormValues>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      proposalId: Number(proposal.id),
      userId: Number(user.id),
      choice: undefined,
      comment: "",
      formatChoice: undefined,
      formatComment: "",
    },
  });
  const onSubmit: Parameters<typeof handleSubmit>[0] = (data) => {
    voteMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };
  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <ProposalHeader proposal={proposal} t={t} dateFnsLocale={dateFnsLocale} />
      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
        <VoteSubjectBlock
          t={t}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />
        {proposal.format && (
          <VoteFormatBlock
            t={t}
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
            format={proposal.format}
          />
        )}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit_my_vote")}
          </Button>
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              aria-label={t("back_to_list")}
            >
              {t("back")}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}

export default VoteScreen;
