import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Check, X } from "lucide-react";

function VoteSubjectBlock({ t, register, setValue, watch, errors }: any) {
  return (
    <div className="flex flex-col gap-6" aria-label={t("vote_for_subject")}>
      <div className="font-semibold text-base mb-1">
        {t("vote_for_subject")}
      </div>
      <div className="flex gap-4">
        <Button
          type="button"
          variant={watch("choice") === "for" ? "default" : "outline"}
          className={
            watch("choice") === "for"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : ""
          }
          onClick={() => setValue("choice", "for")}
          aria-pressed={watch("choice") === "for"}
          aria-label={t("vote_for")}
        >
          <Check className="mr-2 w-4 h-4" />
          {t("for")}
        </Button>
        <Button
          type="button"
          variant={watch("choice") === "against" ? "default" : "outline"}
          className={
            watch("choice") === "against"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : ""
          }
          onClick={() => setValue("choice", "against")}
          aria-pressed={watch("choice") === "against"}
          aria-label={t("vote_against")}
        >
          <X className="mr-2 w-4 h-4" />
          {t("against")}
        </Button>
      </div>
      <Textarea
        {...register("comment")}
        value={watch("comment")}
        onChange={(e) => setValue("comment", e.target.value)}
        placeholder={t("leave_comment_optional")}
        aria-label={t("feedback_on_choice")}
        maxLength={400}
        className="min-h-[80px]"
      />
      {errors.comment && (
        <div className="text-red-500 text-sm" role="alert">
          {errors.comment.message}
        </div>
      )}
    </div>
  );
}
export default VoteSubjectBlock;
