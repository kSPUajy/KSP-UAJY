import { modulFiles } from '@/components/sections/modul/modul-format'
import type { JenisBerkasModul } from '@/components/sections/modul/modul-format'
import { Badge } from '@/components/ui/Badge'
import type { Modul } from '@/lib/types'
import { cn } from '@/lib/utils'

const LINK_CLASS = 'text-accent-fg underline decoration-2 underline-offset-4 hover:text-fg'

type ModulFilesProps = {
  modul: Pick<Modul, 'id' | 'minggu' | 'judul' | 'berkasUrl' | 'tugasGuidedUrl' | 'tugasUnguided'>
  /** Which files to list; all three by default. */
  only?: readonly JenisBerkasModul[]
  /** Printed dim before the files, e.g. `berkas`. */
  label?: string
  /** Shown when there is nothing to list; empty renders nothing at all. */
  emptyText?: string
  className?: string
}

/**
 * A module's files on one line — `modul.pdf ↓ · tugas-guided.zip ↓ ·
 * tugas-unguided.pdf [terkunci]` — each downloadable whatever the week,
 * except the unguided task while the admin keeps it locked.
 */
export function ModulFiles({ modul, only, label, emptyText = 'berkas belum diunggah', className }: ModulFilesProps) {
  const files = modulFiles(modul).filter((file) => !only || only.includes(file.jenis))
  if (files.length === 0) return emptyText ? <p className={cn('text-dim', className)}>{emptyText}</p> : null

  return (
    <ul aria-label={`Berkas ${modul.judul}`} className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      {label ? (
        <li aria-hidden className="text-dim">
          {label}:
        </li>
      ) : null}
      {files.map((file, index) => (
        <li key={file.jenis} className="inline-flex items-center gap-3">
          {index > 0 ? (
            <span aria-hidden className="text-dim">
              ·
            </span>
          ) : null}
          {file.kind === 'terkunci' ? (
            <span className="inline-flex items-center gap-2 text-dim">
              {file.label}
              <Badge variant="ghost" size="sm">
                terkunci
              </Badge>
            </span>
          ) : file.kind === 'unduh' ? (
            <a href={file.href} className={LINK_CLASS}>
              <span className="sr-only">unduh </span>
              {file.label}
              <span aria-hidden> ↓</span>
              <span className="sr-only"> ({modul.judul})</span>
            </a>
          ) : (
            <a href={file.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {file.label}
              <span aria-hidden> ↗</span>
              <span className="sr-only"> ({modul.judul}, membuka tab baru)</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}
