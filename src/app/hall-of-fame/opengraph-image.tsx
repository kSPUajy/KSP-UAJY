import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Hall of fame challenge mingguan'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgCard({
    accent: 'orange',
    file: '~/hall-of-fame/',
    command: 'top -o menang',
    eyebrow: 'hall of fame',
    title: 'Yang paling sering menang',
    subtitle: 'Juara challenge mingguan, papan peringkat sepanjang masa, dan solusi yang menang.',
  })
}
