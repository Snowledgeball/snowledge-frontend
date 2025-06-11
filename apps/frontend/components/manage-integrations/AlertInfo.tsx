import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/alert";

interface AlertInfoProps {
  title: string;
  description: React.ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

export const AlertInfo: React.FC<AlertInfoProps> = ({
  title,
  description,
  variant = "default",
  className,
}) => (
  <Alert variant={variant} className={className}>
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
);
