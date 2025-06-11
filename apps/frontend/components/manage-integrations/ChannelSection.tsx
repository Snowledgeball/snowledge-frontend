import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/alert";
import { ChannelInput } from "./ChannelInput";
import { ChannelNames, KindOfMissing } from "./types";

interface ChannelSectionProps {
  type: keyof ChannelNames;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onValidate?: () => void;
  isLoading: boolean;
  isMissing: KindOfMissing;
}

export const ChannelSection: React.FC<ChannelSectionProps> = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  onValidate,
  isLoading,
  isMissing,
}) => (
  <div>
    <label>{label}</label>
    {isMissing ? (
      <>
        {isMissing.channelName && isMissing.channelName[type] && (
          <Alert variant="destructive" className="mb-2">
            <AlertTitle>Salon manquant :</AlertTitle>
            <AlertDescription>
              Le salon assigné pour {label.toLowerCase()} n'existe plus sur
              Discord.
              <br />
              Veuillez en créer un nouveau.
            </AlertDescription>
          </Alert>
        )}
        <ChannelInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isLoading}
          canRename={false}
        />
      </>
    ) : (
      <ChannelInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onValidate={onValidate}
        disabled={isLoading}
        canRename={true}
      />
    )}
  </div>
);
