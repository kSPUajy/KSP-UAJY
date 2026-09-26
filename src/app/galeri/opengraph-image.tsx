import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Galeri kegiatan Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'magenta',
    file: '~/galeri/',
    command: 'ls -lt ~/galeri',
    eyebrow: 'galeri',
    title: 'Papan Mading KSP',
    subtitle: 'Momen dari kelas, workshop, kompetisi, dan kumpul-kumpul anggota.',
  })
}
