import type { MetadataRoute } from 'next'

import { siteConfig } from '@/site.config'

/** Lets the site be added to a phone's home screen with its own name and colours. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} ${siteConfig.campus.short}`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    lang: 'id',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0d12',
    theme_color: '#0b0d12',
    icons: [
      { src: siteConfig.logo.src, sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
