"use client";

import { createContext, useState, useMemo, type PropsWithChildren, useEffect } from "react";

type Language = {
  code: string;
  name: string;
};

export const languages: Language[] = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
];

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const defaultLanguage = languages[0]; // Español

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const browserLangCode = navigator.language.split('-')[0];
    const matchedLanguage = languages.find(l => l.code === browserLangCode);
    if (matchedLanguage) {
      setLanguage(matchedLanguage);
    }
  }, []);


  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
