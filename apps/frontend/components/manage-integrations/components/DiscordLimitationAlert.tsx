import React from "react";
import { AlertInfo } from "./AlertInfo";
import { useTranslations } from "next-intl";

export const DiscordLimitationAlert: React.FC = () => {
  const t = useTranslations("manageIntegrations");
  return (
    <AlertInfo
      title={t("discordLimitation")}
      description={
        <span>
          {t.rich("discordLimitationDescription", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
          <br />
          <br />
          <i>{t("discordLimitationDescription2")}</i>
        </span>
      }
      className="mb-4"
    />
  );
};

export default DiscordLimitationAlert;
