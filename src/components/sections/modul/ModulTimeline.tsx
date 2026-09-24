import { modulRange, modulRelease } from '@/components/sections/modul/modul-format'
import { Badge } from '@/components/ui/Badge'
import type { ModulStatus, TimelineEntry } from '@/lib/types'
import { cn, pad2 } from '@/lib/utils'

type ModulTimelineProps = {
  entries: readonly TimelineEntry[]
}

/** The marker printed before each row, like a checklist in a terminal. */
const MARKER: Record<ModulStatus, string> = {
  selesai: '[x]',
  berjalan: '[>]',
  terkunci: '[ ]',
}

const STATUS_TEXT: Record<ModulStatus, string> = {
  selesai: 'selesai',
  berjalan: 'minggu ini',
  terkunci: 'belum dibuka',
}

/**
 * The whole schedule as one rail: finished rows filled in, this week's lit
 * in the accent and marked `aria-current`, the rest hollow and dimmed with
 * their start date. Sessions that are not modules (Games, Review Materi)
 * sit on the same rail with a dashed node and no task. The status is always
 * spelled out in text as well — colour and the node are only the second way
 * of saying it.
 */
export function ModulTimeline({ entries }: ModulTimelineProps) {
  return (
    <ol className="border-l-2 border-line">
      {entries.map((entry) => {
        const current = entry.status === 'berjalan'
        const locked = entry.status === 'terkunci'
        const sesi = entry.jenis === 'sesi'

        return (
          <li
            key={entry.id}
            id={sesi ? entry.id : `minggu-${pad2(entry.minggu)}`}
            aria-current={current ? 'step' : undefined}
            className={cn(
              'relative grid scroll-mt-24 grid-cols-1 gap-x-8 gap-y-2 py-5 pr-4 pl-6 sm:grid-cols-[7rem_minmax(0,1fr)] sm:pl-8',
              current && 'border-y-2 border-r-2 border-line bg-surface',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'absolute top-[1.85rem] -left-[8px] block h-3.5 w-3.5 border-2',
                sesi ? 'border-dashed border-line' : 'border-line',
                current ? 'bg-accent' : locked || sesi ? 'bg-canvas' : 'bg-line',
              )}
            />

            <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
              <p
                className={cn(
                  'font-display text-[11px] tracking-[0.14em] uppercase',
                  locked || sesi ? 'text-dim' : 'text-accent-fg',
                )}
              >
                {sesi ? 'sesi' : `modul ${pad2(entry.minggu)}`}
              </p>
              <p className="text-[11px] leading-5 text-dim tabular-nums">{modulRange(entry)}</p>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className={cn('text-base leading-7 font-bold', locked ? 'text-muted' : 'text-fg')}>
                  <span aria-hidden className={cn('mr-2 font-normal', current ? 'text-accent-fg' : 'text-dim')}>
                    {MARKER[entry.status]}
                  </span>
                  {entry.judul}
                </h3>
                {current ? (
                  <Badge variant="solid" size="sm">
                    {STATUS_TEXT.berjalan}
                  </Badge>
                ) : (
                  <span className="sr-only">({STATUS_TEXT[entry.status]})</span>
                )}
                {sesi ? (
                  <Badge variant="ghost" size="sm">
                    tanpa tugas
                  </Badge>
                ) : null}
              </div>

              <p className={cn('mt-1 max-w-prose text-[13px] leading-6', locked ? 'text-dim' : 'text-muted')}>
                {entry.ringkasan}
              </p>

              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-5 text-dim">
                {sesi ? (
                  <span>
                    pj: <span className="text-muted">{entry.pj || '—'}</span>
                  </span>
                ) : (
                  <>
                    <span>
                      tentor pj: <span className="text-muted">{entry.tentorPj.join(', ')}</span>
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      koordinator: <span className="text-muted">{entry.koordinator}</span>
                    </span>
                  </>
                )}
                <span aria-hidden>·</span>
                {locked ? (
                  <span>dibuka {modulRelease(entry)}</span>
                ) : sesi ? (
                  <span>tanpa modul</span>
                ) : entry.berkasUrl ? (
                  <a
                    href={entry.berkasUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-fg underline decoration-2 underline-offset-4 hover:text-fg"
                  >
                    buka modul<span aria-hidden> ↗</span>
                    <span className="sr-only"> {entry.judul} (membuka tab baru)</span>
                  </a>
                ) : (
                  <span>berkas menyusul</span>
                )}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
