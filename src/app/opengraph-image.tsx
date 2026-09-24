import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'
import { siteConfig } from '@/site.config'

export const alt = 'Kartu Kelompok Studi Pemrograman UAJY'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'magenta',
    file: '~/',
    command: siteConfig.heroCommand,
    eyebrow: 'beranda',
    title: siteConfig.name,
    subtitle: siteConfig.tagline,
  })
}
