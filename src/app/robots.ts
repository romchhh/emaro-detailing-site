import type { MetadataRoute } from 'next'
import { absoluteUrl, SITE_URL } from './seo'

const DISALLOW = ['/api/', '/admin', '/admin/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'GPTBot',
        allow: ['/llms.txt', '/'],
        disallow: DISALLOW,
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/llms.txt', '/'],
        disallow: DISALLOW,
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
