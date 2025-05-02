"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import des traductions
import commonFR from "../public/locales/fr/common.json";
import commonEN from "../public/locales/en/common.json";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    debug: true, // Active les logs de debug
    resources: {
      fr: {
        translation: commonFR,
      },
      en: {
        translation: commonEN,
      },
    },
    lng: "fr",
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    defaultNS: "translation",
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
