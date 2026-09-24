import Link from 'next/link'

import { modulRelease } from '@/components/sections/modul/modul-format'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { formatTanggalPendek } from '@/lib/format'
import type { ModulStatus, ModulWithStatus } from '@/lib/types'
import { cn, pad2 } from '@/lib/utils'

type HeroModulPanelProps = {
  modules: readonly ModulWithStatus[]
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

/** `21 Sep 2026` -> `21 Sep`: the year is the same all semester. */
const shortDate = (iso: string): string => formatTanggalPendek(iso).replace(/ \d{4}$/, '')

/**
 * The semester's modules as a checklist, in the hero's right-hand column.
 * Every week is one line; this week's is lit and opens up to show who
 * teaches it. Below `lg` only this week's line is shown — the whole list
 * would push the buttons off a phone's first screen, and `/modul` is a tap
 * away.
 */
export function HeroModulPanel({ modules }: HeroModulPanelProps) {
  const current = modules.find((modul) => modul.status === 'berjalan')
  const done = modules.filter((modul) => modul.status === 'selesai').length

  return (
    <TerminalWindow title="~/modul/jadwal.log" tone="code" bodyClassName="p-0">
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-line-soft px-4 py-3">
        <h2 className="font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">{'// modul kelas'}</h2>
        <p className="text-[11px] text-dim tabular-nums">
          {current ? `minggu ${pad2(current.minggu)}/${pad2(modules.length)}` : `${done}/${modules.length} selesai`}
        </p>
      </div>

      <ol aria-label="Timeline modul" className="py-1.5">
        {modules.map((modul) => {
          const isCurrent = modul.status === 'berjalan'
          const locked = modul.status === 'terkunci'

          return (
            <li key={modul.id} className={cn(!isCurrent && 'hidden lg:block')}>
              <Link
                href={`/modul#minggu-${pad2(modul.minggu)}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'group grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-baseline gap-x-2.5 px-4 text-[12px] leading-5 transition-colors',
                  isCurrent ? 'my-1 border-y-2 border-accent bg-surface-2 py-2.5' : 'py-[5px] hover:bg-surface-2',
                )}
              >
                <span aria-hidden className={isCurrent ? 'text-accent-fg' : 'text-dim'}>
                  {MARKER[modul.status]}
                </span>
                <span className={cn('tabular-nums', isCurrent ? 'text-accent-fg' : 'text-dim')}>{pad2(modul.minggu)}</span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate group-hover:text-accent-fg',
                      isCurrent ? 'font-bold text-fg' : locked ? 'text-muted' : 'text-fg',
                    )}
                  >
                    {modul.judul}
                  </span>
                  {isCurrent ? (
                    <span className="mt-1 block text-[11px] text-muted lg:truncate">
                      tentor pj: {modul.tentorPj.join(', ')}
                    </span>
                  ) : null}
                  <span className="sr-only">
                    {` — ${STATUS_TEXT[modul.status]}${locked ? `, dibuka ${modulRelease(modul)}` : ''}`}
                  </span>
                </span>
                <span aria-hidden className="text-[11px] text-dim tabular-nums">
                  {isCurrent ? 'minggu ini' : shortDate(modul.rilis)}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="border-t-2 border-line-soft px-4 py-3">
        <Link href="/modul" className="text-[11px] text-accent-fg hover:underline">
          buka timeline lengkap <span aria-hidden>-&gt;</span>
        </Link>
      </div>
    </TerminalWindow>
  )
}
