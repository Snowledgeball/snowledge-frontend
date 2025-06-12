import React from "react";
import { Button } from "@repo/ui/components/button";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface ChannelInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onValidate?: () => void;
  disabled?: boolean;
  canRename?: boolean;
}

export const ChannelInput: React.FC<ChannelInputProps> = ({
  value,
  onChange,
  placeholder,
  onValidate,
  disabled,
  canRename,
}) => {
  const t = useTranslations("manageIntegrations");
  return (
    <div className="flex items-center gap-2">
      <input
        className="border rounded px-2 py-1 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {!!value && canRename && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onValidate}
          disabled={disabled || !value}
          aria-label={t("validate")}
        >
          <CheckIcon className="h-4 w-4 text-green-600" />
        </Button>
      )}
    </div>
  );
};
