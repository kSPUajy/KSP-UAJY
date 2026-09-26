import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Struktur organisasi Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'violet',
    file: '~/struktur/org.h',
    command: 'cd ~/struktur',
    eyebrow: 'struktur',
    title: 'Orang-orang di balik KSP',
    subtitle: 'Pengurus harian, kominfo, dan USDA yang menjalankan KSP setiap minggu.',
  })
}
