import type { MetadataRoute } from 'next'

import { siteConfig } from '@/site.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/kitchen-sink', '/masuk', '/dashboard', '/admin', '/penilaian'] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
