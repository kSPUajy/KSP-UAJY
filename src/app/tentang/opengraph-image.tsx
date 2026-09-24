import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Tentang Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'violet',
    file: '~/tentang/README.md',
    command: 'cat ~/tentang/README.md',
    eyebrow: 'tentang',
    title: 'Kelompok studi, bukan kelas tambahan',
    subtitle: 'Komunitas belajar bahasa C dengan tentor sebaya, challenge mingguan, dan kelas tiap Jumat sore.',
  })
}
