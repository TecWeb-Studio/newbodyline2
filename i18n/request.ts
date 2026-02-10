import { getRequestConfig } from 'next-intl/server'
import { routing } from '../app/i18n/routing'

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale || routing.defaultLocale
  
  if (!routing.locales.includes(resolvedLocale as typeof routing.locales[number])) {
    return {
      locale: routing.defaultLocale,
      messages: (await import(`../app/i18n/messages/${routing.defaultLocale}.json`)).default
    }
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`../app/i18n/messages/${resolvedLocale}.json`)).default
  }
})