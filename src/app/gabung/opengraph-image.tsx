import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Cara bergabung dengan Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'lime',
    file: '~/gabung/',
    command: './gabung --help',
    eyebrow: 'gabung',
    title: 'Belum bisa C? Justru itu alasannya.',
    subtitle: 'Terbuka untuk semua mahasiswa aktif UAJY. Tanpa seleksi, tanpa biaya.',
  })
}
