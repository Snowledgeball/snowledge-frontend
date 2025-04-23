"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const changeLanguage = async (lng: string) => {
    try {
      await i18n.changeLanguage(lng);
      setCurrentLang(lng);
      toast.success(
        `Langue changée en ${lng === "fr" ? "Français" : "English"}`
      );
    } catch (error) {
      console.error("Erreur lors du changement de langue:", error);
      toast.error("Erreur lors du changement de langue");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Changer de langue"
        >
          <Globe className="h-5 w-5" />
          <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-blue-500 text-white rounded-full px-1">
            {currentLang.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => changeLanguage("fr")}
          className={currentLang === "fr" ? "bg-blue-50" : ""}
        >
          🇫🇷 Français
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={currentLang === "en" ? "bg-blue-50" : ""}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
