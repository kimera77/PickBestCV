"use client";

import { createContext, useState, useMemo, type PropsWithChildren } from "react";

type Language = {
  code: string;
  name: string;
};

export const languages: Language[] = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
];

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: languages[0],
  setLanguage: () => {},
});

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(languages[0]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
