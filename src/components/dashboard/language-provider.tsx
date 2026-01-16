"use client";

import { createContext, useState, useMemo, type PropsWithChildren, useEffect } from "react";

type Language = {
  code: string;
  name: string;
};

export const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
];

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const defaultLanguage = languages[1]; // Spanish

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLangCode = localStorage.getItem('language');
    if (savedLangCode) {
      const savedLanguage = languages.find(l => l.code === savedLangCode);
      if (savedLanguage) {
        setLanguage(savedLanguage);
        setIsInitialized(true);
        return;
      }
    }
    
    // If no saved language, try to detect from browser
    const browserLangCode = navigator.language.split('-')[0];
    const matchedLanguage = languages.find(l => l.code === browserLangCode);
    if (matchedLanguage) {
      setLanguage(matchedLanguage);
      localStorage.setItem('language', matchedLanguage.code);
    }
    setIsInitialized(true);
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('language', language.code);
    }
  }, [language, isInitialized]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
