import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['it', 'en', 'de'],
  defaultLocale: 'it',
  localePrefix: 'always'
})

export type Locale = (typeof routing.locales)[number]

export const localeNames: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
  de: 'Deutsch'
}