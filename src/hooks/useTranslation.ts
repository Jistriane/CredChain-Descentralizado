import { useTranslation as useAppTranslation } from '../app/TranslationProvider';

export const useTranslation = () => {
  // Usar o hook diretamente, pois o TranslationProvider já tem fallback
  return useAppTranslation();
};
