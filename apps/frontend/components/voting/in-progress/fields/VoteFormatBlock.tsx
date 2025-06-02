import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Check, X } from "lucide-react";
import { getFormatIconAndLabel } from "@/components/voting/shared/utils/format-utils";

function VoteFormatBlock({
  t,
  register,
  setValue,
  watch,
  errors,
  format,
}: any) {
  const info = getFormatIconAndLabel(format);
  return (
    <div
      className="flex flex-col gap-6 border-t pt-6"
      aria-label={t("vote_for_format")}
    >
      <div className="font-semibold text-base mb-1 flex items-center gap-2">
        {t("vote_for_format")}
        {info ? info.icon : null}
        <span className="text-sm font-normal text-muted-foreground">
          {info ? info.label : format}
        </span>
      </div>
      <div className="flex gap-4">
        <Button
          type="button"
          variant={watch("formatChoice") === "for" ? "default" : "outline"}
          className={
            watch("formatChoice") === "for"
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : ""
          }
          onClick={() => setValue("formatChoice", "for")}
          aria-pressed={watch("formatChoice") === "for"}
          aria-label={t("yes_for_format")}
        >
          <Check className="mr-2 w-4 h-4" />
          {t("yes")}
        </Button>
        <Button
          type="button"
          variant={watch("formatChoice") === "against" ? "default" : "outline"}
          className={
            watch("formatChoice") === "against"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : ""
          }
          onClick={() => setValue("formatChoice", "against")}
          aria-pressed={watch("formatChoice") === "against"}
          aria-label={t("no_for_format")}
        >
          <X className="mr-2 w-4 h-4" />
          {t("no")}
        </Button>
      </div>
      <Textarea
        {...register("formatComment")}
        value={watch("formatComment")}
        onChange={(e) => setValue("formatComment", e.target.value)}
        placeholder={t("leave_comment_format_optional")}
        aria-label={t("feedback_on_format")}
        maxLength={400}
        className="min-h-[80px]"
      />
      {errors.formatComment && (
        <div className="text-red-500 text-sm" role="alert">
          {errors.formatComment.message}
        </div>
      )}
    </div>
  );
}
export default VoteFormatBlock;
