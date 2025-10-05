'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getTranslations, getSupportedLanguages } from '../lib/i18n'

interface TranslationContextType {
  t: (key: string) => string
  language: Language
  setLanguage: (lang: Language) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt-BR')

  // Carregar idioma do localStorage na inicialização
  useEffect(() => {
    const savedLanguage = localStorage.getItem('credchain-language') as Language
    if (savedLanguage && getSupportedLanguages().includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('credchain-language', newLanguage)
  }

  const t = (key: string): string => {
    const translations = getTranslations(language)
    
    // Navegar pela estrutura aninhada usando notação de ponto
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Retorna a chave se não encontrar a tradução
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  const value = {
    t,
    language,
    setLanguage
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation deve ser usado dentro de um TranslationProvider')
  }
  return context
}
