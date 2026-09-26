import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Arsip challenge mingguan'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'magenta',
    file: '~/challenge/',
    command: 'ls ~/challenge',
    eyebrow: 'challenge',
    title: 'Arsip challenge mingguan',
    subtitle: 'Satu soal C untuk setiap modul, terbit tiap Senin.',
  })
}
