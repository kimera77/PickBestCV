import { useContext } from 'react';
import { LanguageContext } from '@/components/dashboard/language-provider';
import { translations, type TranslationKey } from '@/lib/translations';

export function useTranslation() {
  const { language } = useContext(LanguageContext);
  
  const t = (key: TranslationKey): string => {
    return translations[language.code as keyof typeof translations]?.[key] || key;
  };
  
  return { t, language: language.code };
}
