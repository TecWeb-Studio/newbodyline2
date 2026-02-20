import { getRequestConfig } from 'next-intl/server'
import { routing } from '../app/i18n/routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const resolvedLocale = requested && routing.locales.includes(requested as typeof routing.locales[number])
    ? requested
    : routing.defaultLocale

  return {
    locale: resolvedLocale,
    messages: (await import(`../app/i18n/messages/${resolvedLocale}.json`)).default
  }
})