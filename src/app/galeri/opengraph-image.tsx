import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Galeri kegiatan Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'lime',
    file: '~/galeri/',
    command: 'ls -lt ~/galeri',
    eyebrow: 'galeri',
    title: 'Dari ruang kelas dan sekitarnya',
    subtitle: 'Kelas Senin dan Selasa, workshop, kompetisi, dan gathering.',
  })
}
