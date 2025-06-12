import React from "react";
import { AlertInfo } from "./AlertInfo";
import { useTranslations } from "next-intl";

export const FirstConfigAlert: React.FC = () => {
  const t = useTranslations("manageIntegrations");
  return (
    <AlertInfo
      variant="destructive"
      title={t("firstConfigTitle")}
      description={
        <>
          {t("firstConfigDescription")}
          <br />
          {t("firstConfigDescription2")}
        </>
      }
      className="mb-4"
    />
  );
};

export default FirstConfigAlert;
