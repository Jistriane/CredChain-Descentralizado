'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getSupportedLanguages } from '../lib/i18n';

interface TranslationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt-BR');

  // Carregar idioma salvo do localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('credchain-language') as Language;
    if (savedLanguage && getSupportedLanguages().includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Salvar idioma no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('credchain-language', language);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};
