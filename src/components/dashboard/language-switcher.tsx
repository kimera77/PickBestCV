"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

export default function LanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  // In a real app, you would use a library like next-international
  // or i18next to handle translations and routing.
  const handleLanguageChange = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode);
    if(lang) {
        setSelectedLanguage(lang);
        // Here you would typically change the locale of the app
        console.log(`Language changed to ${lang.name}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="text-2xl">{selectedLanguage.flag}</span>
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => handleLanguageChange(lang.code)}
          >
            <span className="text-xl mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
