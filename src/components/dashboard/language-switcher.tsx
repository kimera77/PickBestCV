"use client";

import { useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Languages } from "lucide-react";
import { LanguageContext, languages } from "./language-provider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useContext(LanguageContext);

  const handleLanguageChange = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode);
    if(lang) {
        setLanguage(lang);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 font-semibold">
           <Languages className="h-4 w-4 text-muted-foreground" />
          <span>{language.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuRadioGroup value={language.code} onValueChange={handleLanguageChange}>
            {languages.map((lang) => (
            <DropdownMenuRadioItem
                key={lang.code}
                value={lang.code}
                className="flex items-center justify-between"
            >
                <span>{lang.name}</span>
                {language.code === lang.code && <Check className="h-4 w-4" />}
            </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
