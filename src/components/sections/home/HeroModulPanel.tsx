import Link from 'next/link'

import { modulRelease } from '@/components/sections/modul/modul-format'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { formatTanggalPendek } from '@/lib/format'
import type { ModulStatus, TimelineEntry } from '@/lib/types'
import { cn, pad2 } from '@/lib/utils'

type HeroModulPanelProps = {
  entries: readonly TimelineEntry[]
}

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

/** Rows the panel keeps on a short screen: last week, this week, five ahead. */
const SHORT_WINDOW = 7

/** `21 Sep 2026` -> `21 Sep`: the year is implied by the order. */
const shortDate = (iso: string): string => formatTanggalPendek(iso).replace(/ \d{4}$/, '')

/**
 * The schedule as a checklist, in the hero's right-hand column: every module,
 * plus the sessions between them (Games, Review Materi) dimmed and unnumbered.
 * This week's row is lit and opens up to show who runs it. Below `lg` only
 * that row is shown — or, during a break, the next one — since the whole list
 * would push the buttons off a phone's first screen.
 */
export function HeroModulPanel({ entries }: HeroModulPanelProps) {
  const modules = entries.filter((entry) => entry.jenis === 'modul')
  const current = entries.find((entry) => entry.status === 'berjalan')
  const upcoming = entries.find((entry) => entry.status === 'terkunci')
  const done = modules.filter((entry) => entry.status === 'selesai').length
  const focusId = current?.id ?? upcoming?.id

  // On a laptop-height screen the full list pushes the hero's stats off the
  // first screen, so only a window of rows around the focus stays up there.
  const focusIndex = Math.max(0, entries.findIndex((entry) => entry.id === focusId))
  const windowStart = Math.max(0, Math.min(focusIndex - 1, entries.length - SHORT_WINDOW))
  const inShortWindow = (index: number) => index >= windowStart && index < windowStart + SHORT_WINDOW

  const summary = current
    ? current.jenis === 'modul'
      ? `modul ${pad2(current.minggu)}/${pad2(modules.length)}`
      : current.judul.toLowerCase()
    : upcoming && done > 0
      ? 'jeda'
      : `${done}/${modules.length} selesai`

  return (
    <TerminalWindow title="~/modul/jadwal.log" tone="code" bodyClassName="p-0">
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-line-soft px-5 py-3.5">
        <h2 className="font-display text-[11px] tracking-[0.16em] text-accent-fg uppercase">{'// jadwal kelas'}</h2>
        <p className="text-xs text-dim tabular-nums">{summary}</p>
      </div>

      <ol aria-label="Timeline modul" className="py-1.5">
        {entries.map((entry, index) => {
          const isCurrent = entry.status === 'berjalan'
          const locked = entry.status === 'terkunci'
          const sesi = entry.jenis === 'sesi'

          return (
            <li
              key={entry.id}
              className={cn(entry.id !== focusId && 'max-lg:hidden', !inShortWindow(index) && 'short:lg:hidden')}
            >
              <Link
                href={sesi ? `/modul#${entry.id}` : `/modul#minggu-${pad2(entry.minggu)}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'group grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-baseline gap-x-3 px-5 text-[13px] leading-6 transition-colors xl:text-sm',
                  isCurrent ? 'my-1 border-y-2 border-accent bg-surface-2 py-3' : 'py-1.5 hover:bg-surface-2',
                )}
              >
                <span aria-hidden className={isCurrent ? 'text-accent-fg' : 'text-dim'}>
                  {MARKER[entry.status]}
                </span>
                <span aria-hidden={sesi} className={cn('tabular-nums', isCurrent ? 'text-accent-fg' : 'text-dim')}>
                  {sesi ? '--' : pad2(entry.minggu)}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate group-hover:text-accent-fg',
                      isCurrent ? 'font-bold text-fg' : locked || sesi ? 'text-muted' : 'text-fg',
                      sesi && !isCurrent && 'italic',
                    )}
                  >
                    {entry.judul}
                  </span>
                  {isCurrent ? (
                    <span className="mt-1 block text-xs text-muted lg:truncate">
                      {sesi ? `pj: ${entry.pj || '—'} · tanpa tugas` : `tentor pj: ${entry.tentorPj.join(', ')}`}
                    </span>
                  ) : null}
                  <span className="sr-only">
                    {`${sesi ? ' — sesi tanpa modul' : ''} — ${STATUS_TEXT[entry.status]}${locked ? `, dibuka ${modulRelease(entry)}` : ''}`}
                  </span>
                </span>
                <span aria-hidden className="text-xs text-dim tabular-nums">
                  {isCurrent ? 'minggu ini' : shortDate(entry.rilis)}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="border-t-2 border-line-soft px-5 py-3.5">
        <Link href="/modul" className="text-xs text-accent-fg hover:underline">
          buka timeline lengkap <span aria-hidden>-&gt;</span>
        </Link>
      </div>
    </TerminalWindow>
  )
}
