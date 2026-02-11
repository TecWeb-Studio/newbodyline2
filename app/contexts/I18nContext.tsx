'use client'

import React, { createContext, useContext, useState, useMemo } from 'react'
import en from '@/app/i18n/messages/en.json'
import it from '@/app/i18n/messages/it.json'
import de from '@/app/i18n/messages/de.json'

export type Locale = 'it' | 'en' | 'de'

const messages: Record<Locale, any> = {
  en,
  it,
  de,
}

type I18nContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const defaultLocale: Locale = 'it'
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  const t = (key: string) => {
    const parts = key.split('.')
    let obj: Record<string, any> | undefined = messages[locale]
    for (const p of parts) {
      if (!obj) return key
      obj = obj[p]
    }
    return typeof obj === 'string' ? obj : key
  }

  const value = useMemo(() => ({ locale, setLocale, t }), [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
