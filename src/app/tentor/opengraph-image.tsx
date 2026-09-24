import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Tentor Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'cyan',
    file: '~/tentor/',
    command: 'ls ~/tentor',
    eyebrow: 'tentor',
    title: 'Belajar dari kakak tingkat',
    subtitle: 'Mahasiswa yang memegang kelas C, mendampingi peserta, dan menulis soal challenge.',
  })
}
