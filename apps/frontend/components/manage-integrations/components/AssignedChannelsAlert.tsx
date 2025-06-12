import React from "react";
import { AlertInfo } from "./AlertInfo";
import { useTranslations } from "next-intl";

export const AssignedChannelsAlert: React.FC = () => {
  const t = useTranslations("manageIntegrations");
  return (
    <AlertInfo
      title={t("assignedChannelsTitle")}
      description={t("assignedChannelsDescription")}
      className="mb-4"
    />
  );
};

export default AssignedChannelsAlert;
