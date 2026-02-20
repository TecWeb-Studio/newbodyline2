import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://newbodyline2.com'
const LOCALES = ['it', 'en', 'de']

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    '',
    '/courses',
    '/personal-training',
    '/location',
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LOCALES.map(l => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      })
    }
  }

  return entries
}
