import { useTranslations } from "next-intl";

export function CommunityHeader() {
  const t = useTranslations("communityForm.manage");
  return (
    <div className="bg-background border-b border-border">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
      </div>
    </div>
  );
}
