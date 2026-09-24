import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Berita Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'amber',
    file: '~/berita/',
    command: 'git log --oneline berita/',
    eyebrow: 'berita',
    title: 'Kabar dari sekretariat',
    subtitle: 'Pengumuman, liputan kegiatan, catatan prestasi, dan tutorial C.',
  })
}
