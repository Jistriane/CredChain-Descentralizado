import { useContext } from 'react';
import { Language, Translations, getTranslations } from '../lib/i18n';
import { useTranslationContext } from '../providers/TranslationProvider';

export const useTranslation = (): { t: Translations; language: Language; setLanguage: (language: Language) => void } => {
  const { language, setLanguage } = useTranslationContext();
  const t = getTranslations(language);

  return { t, language, setLanguage };
};
