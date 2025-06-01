import { Button } from "@repo/ui/components/button";
import { ArrowLeft } from "lucide-react";
import type { Proposal } from "@/types/proposal";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { voteSchema, VoteFormValues } from "./vote-schema";
import { useVote } from "./hooks/useVote";
import { useAuth } from "@/contexts/auth-context";
import ProposalHeader from "./fields/ProposalHeader";
import VoteSubjectBlock from "./fields/VoteSubjectBlock";
import VoteFormatBlock from "./fields/VoteFormatBlock";

function VoteScreen({
  closeVoteScreen,
  communitySlug,
  proposal,
  onBack,
}: {
  closeVoteScreen: () => void;
  communitySlug: string;
  proposal: Proposal;
  onBack?: () => void;
}) {
  const t = useTranslations("voting");
  const { user } = useAuth();
  const voteMutation = useVote(communitySlug);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
    window.location.reload();
    voteMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };
  return (
    <div className="relative p-6 bg-background rounded-lg shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={closeVoteScreen}
        aria-label="Retour"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <section className="w-full max-w-2xl mx-auto flex flex-col gap-8">
        <ProposalHeader proposal={proposal} t={t} />
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
    </div>
  );
}

export default VoteScreen;
