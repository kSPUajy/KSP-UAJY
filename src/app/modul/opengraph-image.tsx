import { getTimeline } from '@/lib/data'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'
import { pad2 } from '@/lib/utils'

export const alt = 'Modul mingguan Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Regenerated with the page, so a shared link shows this week's module. */
export const revalidate = 3600

export default async function Image() {
  const current = (await getTimeline()).find((entry) => entry.status === 'berjalan')
  return renderOgCard({
    accent: 'cyan',
    file: '~/modul/',
    command: 'ls ~/modul',
    eyebrow: current ? (current.jenis === 'modul' ? `modul · ${pad2(current.minggu)}` : 'jadwal · sesi') : 'modul',
    title: current ? `Minggu ini: ${current.judul}` : 'Modul mingguan',
    subtitle: current?.ringkasan ?? 'Satu modul setiap minggu, dari flowchart sampai array of record.',
  })
}
