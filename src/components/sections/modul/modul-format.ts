import { formatTanggalPendek, namaHari, slugify } from '@/lib/format'
import type { ModulWithStatus } from '@/lib/types'
import { pad2 } from '@/lib/utils'

/** `~/modul/minggu-02/flowchart-2.pdf` */
export const modulPath = (modul: ModulWithStatus): string =>
  `~/modul/minggu-${pad2(modul.minggu)}/${slugify(modul.judul)}.pdf`

/** `21 Sep – 27 Sep 2026`, dropping the first year when both ends share it. */
export function modulRange(modul: { rilis: string; sampai: string }): string {
  const from = formatTanggalPendek(modul.rilis)
  const to = formatTanggalPendek(modul.sampai)
  const year = modul.rilis.slice(0, 4)
  return modul.sampai.startsWith(year) ? `${from.replace(` ${year}`, '')} – ${to}` : `${from} – ${to}`
}

/** `Senin, 28 Sep 2026` */
export const modulRelease = (modul: { rilis: string }): string =>
  `${namaHari(modul.rilis)}, ${formatTanggalPendek(modul.rilis)}`
