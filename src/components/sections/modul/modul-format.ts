import { formatTanggalPendek, namaHari, slugify } from '@/lib/format'
import type { Modul, ModulWithStatus } from '@/lib/types'
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

/** `ksp-modul-02-flowchart-2.pdf`, or `ksp-modul-02-flowchart-2-tugas-guided.zip` for one of its tasks. */
export const modulFileName = (modul: { minggu: number; judul: string }, bagian: string | null, extension: string): string =>
  `ksp-modul-${pad2(modul.minggu)}-${slugify(modul.judul)}${bagian ? `-${bagian}` : ''}.${extension}`

export type ModulBerkas = {
  /** The file itself, for reading in a tab. */
  href: string
  /** Same file sent as an attachment; only for files in our own bucket. */
  unduhHref?: string
  /** `pdf` or `zip`, when the file is ours and the name says so. */
  extension?: 'pdf' | 'zip'
}

/**
 * A public file's links, whatever week it is — past and upcoming modules
 * are downloadable too. A file uploaded through the admin panel sits in the
 * public `modul` bucket, where `?download=<name>` makes Supabase send it as
 * an attachment named after the module (the `download` attribute is ignored
 * cross-origin). A link elsewhere, such as Google Drive, can only be opened.
 */
function publicBerkas(url: string, modul: { minggu: number; judul: string }, bagian: string | null): ModulBerkas {
  if (!url.includes('/storage/v1/object/public/modul/')) return { href: url }
  const download = new URL(url)
  const extension = /\.zip$/i.test(download.pathname) ? 'zip' : 'pdf'
  download.searchParams.set('download', modulFileName(modul, bagian, extension))
  return { href: url, unduhHref: download.toString(), extension }
}

/** The module file itself. */
export function modulBerkas(modul: { minggu: number; judul: string; berkasUrl?: string }): ModulBerkas | null {
  return modul.berkasUrl ? publicBerkas(modul.berkasUrl, modul, null) : null
}

export type JenisBerkasModul = 'modul' | 'guided' | 'unguided'

/** One of a module's files as the site offers it. */
export type BerkasEntry = {
  jenis: JenisBerkasModul
  /** File-style label: `modul.pdf`, `tugas-guided.zip`, `tugas-unguided`. */
  label: string
} & (
  | { kind: 'unduh'; href: string }
  /** A link elsewhere, opened in a tab. */
  | { kind: 'buka'; href: string }
  /** The unguided task while the admin keeps it switched off. */
  | { kind: 'terkunci' }
)

const BASE_LABEL: Record<JenisBerkasModul, string> = { modul: 'modul', guided: 'tugas-guided', unguided: 'tugas-unguided' }

/**
 * Every file a module has, in order: the module, the guided task, the
 * unguided task. Missing files are left out. The unguided task always goes
 * through `/modul/<id>/tugas-unguided`, which checks the lock itself, so a
 * page cached while it was open still cannot hand it out once it is closed.
 */
export function modulFiles(modul: Pick<Modul, 'id' | 'minggu' | 'judul' | 'berkasUrl' | 'tugasGuidedUrl' | 'tugasUnguided'>): BerkasEntry[] {
  const entries: BerkasEntry[] = []
  const add = (jenis: JenisBerkasModul, berkas: ModulBerkas): void => {
    const label = berkas.extension ? `${BASE_LABEL[jenis]}.${berkas.extension}` : BASE_LABEL[jenis]
    entries.push(berkas.unduhHref ? { jenis, label, kind: 'unduh', href: berkas.unduhHref } : { jenis, label, kind: 'buka', href: berkas.href })
  }
  if (modul.berkasUrl) add('modul', publicBerkas(modul.berkasUrl, modul, null))
  if (modul.tugasGuidedUrl) add('guided', publicBerkas(modul.tugasGuidedUrl, modul, 'tugas-guided'))
  if (modul.tugasUnguided) {
    const label = `${BASE_LABEL.unguided}.${modul.tugasUnguided.path.endsWith('.zip') ? 'zip' : 'pdf'}`
    entries.push(
      modul.tugasUnguided.terbuka
        ? { jenis: 'unguided', label, kind: 'unduh', href: `/modul/${modul.id}/tugas-unguided` }
        : { jenis: 'unguided', label, kind: 'terkunci' },
    )
  }
  return entries
}
