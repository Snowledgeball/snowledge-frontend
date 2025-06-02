import { useState } from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormSchema } from "./useCommunityFormSchema";

export function useCommunityType(
  watch: UseFormWatch<FormSchema>,
  setValue: UseFormSetValue<FormSchema>
) {
  const [communityType, setCommunityType] = useState<"free" | "paid">(
    watch("communityType") || "free"
  );
  const handleCommunityTypeChange = (value: "free" | "paid") => {
    setCommunityType(value);
    setValue("communityType", value);
  };
  return [communityType, handleCommunityTypeChange] as const;
}
