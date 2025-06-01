import { useLocale } from "next-intl";
import { fr, enUS } from "date-fns/locale";

export function useDateFnsLocale() {
  const locale = useLocale();
  return locale === "fr" ? fr : enUS;
}
