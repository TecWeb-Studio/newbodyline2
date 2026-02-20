'use client'

import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/app/i18n/navigation'

export type Locale = 'it' | 'en' | 'de'

type I18nContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const currentLocale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  // Use root-level translations from next-intl (all keys in one flat namespace)
  const tFn = useTranslations()

  const setLocale = useCallback((newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }, [router, pathname])

  const t = useCallback((key: string) => {
    try {
      return tFn(key as any)
    } catch {
      return key
    }
  }, [tFn])

  const value = useMemo(() => ({
    locale: currentLocale,
    setLocale,
    t,
  }), [currentLocale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
