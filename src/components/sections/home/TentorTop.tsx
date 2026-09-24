'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'

import { DitherImage } from '@/components/ui/DitherImage'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { PORTRAIT } from '@/lib/types'
import { cn } from '@/lib/utils'

/** R teaching this week · S module still ahead · Z all modules done · I not assigned yet. */
export type TopStat = 'R' | 'S' | 'Z' | 'I'

export type TopRow = {
  id: string
  pid: number
  nama: string
  slug: string
  foto: string
  stat: TopStat
  /** `M01 Flowchart 1`, one per module. */
  modul: string[]
  /** What `ps` would print for them this week. */
  command: string
  /** Lower-cased haystack for the filter: name, modules, skills. */
  search: string
}

type TentorTopProps = {
  rows: readonly TopRow[]
  /** `modul 01/12 · Flowchart 1` — the load line. */
  load: string
  /** Current week out of the total, for the meter. */
  progress: { done: number; total: number }
}

const STAT_TEXT: Record<TopStat, string> = {
  R: 'mengajar minggu ini',
  S: 'modulnya belum mulai',
  Z: 'modulnya sudah selesai',
  I: 'belum ditugaskan',
}

/** Searches that surface the ghost process. */
const GHOST_WORDS = ['2024', 'root', 'whoami', 'dev', 'ghost']

/** The one who built all this, still running in the background. */
const GHOST: TopRow = {
  id: 'ghost',
  pid: 2024,
  nama: '▒▒▒▒▒ ▒▒▒▒▒▒▒▒▒▒▒',
  slug: '',
  foto: '',
  stat: 'Z',
  modul: [],
  command: 'nohup ./ksp-web &  # angkatan 2024, udah pensiun tapi siapa?  [3/5] ← →',
  search: '',
}

/** Its child process, locked out — the hint towards the next egg (`sudo`). */
const GHOST_CHILD: TopRow = {
  id: 'ghost-child',
  pid: 2025,
  nama: 'root',
  slug: '',
  foto: '',
  stat: 'S',
  modul: [],
  command: 'cat /etc/ksp/secret  # permission denied. butuh sudo?',
  search: '',
}

/** Rows a phone shows before asking for a search. */
const PHONE_ROWS = 8

/** Searches the idle prompt types for itself, to show the filter works. */
const DEMO = ['array', 'M05', 'flowchart', 'prosedur', 'M12', 'fungsi']

/** A CPU reading for a row: busy while teaching, idle otherwise. */
function useCpu(stat: TopStat, live: boolean, ghost = false): number {
  const [value, setValue] = useState(stat === 'R' ? 72 : ghost ? 99 : 0)
  useEffect(() => {
    if (!live || (stat !== 'R' && !ghost)) return
    // The ghost thrashes: anywhere from idle to pegged, several times a second.
    const timer = window.setInterval(
      () => setValue(ghost ? Math.round(Math.random() ** 0.6 * 100) : 48 + Math.round(Math.random() * 50)),
      ghost ? 90 + Math.random() * 60 : 700 + Math.random() * 500,
    )
    return () => window.clearInterval(timer)
  }, [live, stat, ghost])
  return ghost || stat === 'R' ? value : stat === 'S' ? 0.1 : 0
}

function Row({
  row,
  live,
  active,
  dimmed,
  wideOnly,
  onHover,
}: {
  row: TopRow
  live: boolean
  active: boolean
  /** Not matched by the self-typing demo search: faded, not removed. */
  dimmed: boolean
  /** Past the phone cut-off: shown from `sm` up only. */
  wideOnly: boolean
  onHover: () => void
}) {
  const cpu = useCpu(row.stat, live, row.id === 'ghost')
  const running = row.stat === 'R'
  return (
    <motion.li
      className={wideOnly ? 'hidden sm:block' : undefined}
      layout={live ? 'position' : false}
      initial={live ? { opacity: 0, x: -8 } : false}
      animate={{ opacity: dimmed ? 0.28 : 1, x: 0 }}
      exit={live ? { opacity: 0, x: 8, transition: { duration: 0.12 } } : undefined}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={row.slug ? `/tentor/${row.slug}` : '/tentang'}
        onPointerEnter={onHover}
        onFocus={onHover}
        className={cn(
          'grid grid-cols-[2.75rem_minmax(0,1fr)_1.5rem] items-center gap-x-3 px-3 py-1.5 text-[12px] leading-5 transition-colors sm:grid-cols-[2.75rem_minmax(0,13rem)_1.5rem_7.5rem_minmax(0,1fr)] sm:text-[13px]',
          active ? 'bg-accent text-canvas' : running ? 'bg-accent/10 hover:bg-surface-2' : 'hover:bg-surface-2',
        )}
      >
        <span className={cn('tabular-nums', active ? 'text-canvas' : 'text-dim')}>{row.pid}</span>
        <span className={cn('truncate', active ? 'font-bold' : running ? 'font-bold text-fg' : 'text-fg')}>{row.nama}</span>
        <span className={cn('font-bold', active ? 'text-canvas' : running ? 'text-accent-fg' : row.stat === 'Z' ? 'text-dim' : 'text-muted')}>
          {row.stat}
          <span className="sr-only"> — {STAT_TEXT[row.stat]}</span>
        </span>
        <span aria-hidden className="hidden items-center gap-2 sm:flex">
          <span className={cn('relative h-2.5 flex-1 border', active ? 'border-canvas/60' : 'border-line-soft')}>
            <span
              className={cn('absolute inset-y-0 left-0 transition-[width] ease-out', row.id === 'ghost' ? 'duration-75' : 'duration-500', active ? 'bg-canvas' : 'bg-accent')}
              style={{ width: `${Math.min(cpu, 100)}%` }}
            />
          </span>
          <span className="w-8 text-right tabular-nums">{cpu < 1 ? cpu.toFixed(1) : cpu}</span>
        </span>
        <span className={cn('col-span-3 truncate pl-[3.5rem] sm:col-span-1 sm:pl-0', active ? 'text-canvas' : 'text-muted')}>
          {row.command}
        </span>
      </Link>
    </motion.li>
  )
}

/**
 * The tentors as `htop`: one process per tentor, their state taken from the
 * real schedule — whoever's module runs this week is `R` and rises to the
 * top with a busy CPU bar; the rest sleep until their week (`S`) or have
 * already exited (`Z`). It re-sorts itself every Monday with no one editing it.
 *
 * The prompt above the table is `grep`: type to filter by name, module or
 * skill. Left alone, it types example searches itself (stopping the moment
 * anyone focuses it). Hovering a row shows that tentor beside the table.
 * Under reduced motion there is no self-typing and no jitter.
 */
export function TentorTop({ rows, load, progress }: TentorTopProps) {
  const mode = useMotionMode()
  const live = mode === 'full'
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.2 })

  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [demo, setDemo] = useState('')
  const [hoverId, setHoverId] = useState<string | null>(null)

  // The idle prompt types, holds, and erases example searches in a loop.
  const demoOn = live && inView && !focused && query === ''
  useEffect(() => {
    if (!demoOn) return
    let cancelled = false
    let word = 0
    const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
    void (async () => {
      setDemo('')
      await sleep(1200)
      while (!cancelled) {
        const target = DEMO[word % DEMO.length] ?? ''
        for (let i = 1; i <= target.length && !cancelled; i += 1) {
          setDemo(target.slice(0, i))
          await sleep(110)
        }
        await sleep(2200)
        for (let i = target.length - 1; i >= 0 && !cancelled; i -= 1) {
          setDemo(target.slice(0, i))
          await sleep(45)
        }
        await sleep(900)
        word += 1
      }
    })()
    return () => {
      cancelled = true
    }
  }, [demoOn])

  // What the visitor types filters the table, like grep. The demo only
  // highlights: rows that do not match fade, so the table never jumps.
  const needle = query.trim().toLowerCase()
  const demoNeedle = demoOn ? demo.trim().toLowerCase() : ''
  const shown = useMemo(() => {
    const found = needle ? rows.filter((row) => row.search.includes(needle)) : rows
    // Easter egg: grep for the right thing and a process nobody listed turns up.
    return GHOST_WORDS.some((word) => needle === word) ? [...found, GHOST, GHOST_CHILD] : found
  }, [rows, needle])
  const demoMatch = (row: TopRow): boolean => demoNeedle === '' || row.search.includes(demoNeedle)

  const counts = useMemo(() => {
    const tally = { R: 0, S: 0, Z: 0, I: 0 }
    for (const row of rows) tally[row.stat] += 1
    return tally
  }, [rows])

  const preview =
    shown.find((row) => row.id === hoverId && row.foto) ??
    (demoNeedle ? shown.find(demoMatch) : undefined) ??
    shown.find((row) => row.stat === 'R') ??
    shown[0]
  const meterCells = 24
  const filled = Math.round((progress.done / Math.max(progress.total, 1)) * meterCells)

  return (
    // Always a dark terminal, whatever the band behind it.
    <div ref={rootRef} data-palette="dark" data-accent="cyan">
      <TerminalWindow title="~/tentor — htop" tone="code" bodyClassName="p-0">
        {/* Summary, as htop prints it. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-1 border-b-2 border-line-soft px-3 py-3 text-[12px] leading-5 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <span className="text-accent-fg">Mdl</span>
            <span aria-hidden className="text-dim">[</span>
            <span aria-hidden className="flex-1 truncate tracking-[-0.05em] text-accent-fg">
              {'|'.repeat(filled)}
              <span className="text-line-soft">{'|'.repeat(meterCells - filled)}</span>
            </span>
            <span className="text-dim tabular-nums">
              {progress.done}/{progress.total}]
            </span>
          </p>
          <p className="text-muted">
            <span className="text-accent-fg">Tasks:</span> {rows.length} total, <span className="font-bold text-fg">{counts.R} running</span>, {counts.S + counts.I} sleeping,{' '}
            {counts.Z} zombie
          </p>
          <p className="truncate text-muted sm:col-span-2">
            <span className="text-accent-fg">Load:</span> {load}
          </p>
        </div>

        {/* grep */}
        <label className="flex items-center gap-2 border-b-2 border-line-soft px-3 py-2.5 text-[13px] leading-6">
          <span aria-hidden className="shrink-0 text-accent-fg">$</span>
          <span aria-hidden className="shrink-0 text-muted">ps aux | grep</span>
          <span className="sr-only">Cari tentor berdasarkan nama, modul, atau keahlian</span>
          <span className="relative min-w-0 flex-1">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              spellCheck={false}
              autoComplete="off"
              placeholder={demoOn ? '' : 'nama, modul (M05), materi…'}
              className="w-full bg-transparent text-fg caret-accent outline-none placeholder:text-dim"
            />
            {demoOn ? (
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-fg">
                {demoOn ? demo : ''}
                <span className="cursor-blink ml-px inline-block h-4 w-2 bg-accent" />
              </span>
            ) : null}
          </span>
          <span aria-live="polite" className="shrink-0 text-[11px] text-dim tabular-nums">
            {needle ? `${shown.length} cocok` : demoNeedle ? `${rows.filter(demoMatch).length} cocok` : ''}
          </span>
        </label>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            {/* Header row, htop's inverse bar. */}
            <p
              aria-hidden
              className="grid grid-cols-[2.75rem_minmax(0,1fr)_1.5rem] gap-x-3 bg-accent px-3 py-1 text-[11px] leading-5 font-bold tracking-[0.06em] text-canvas uppercase sm:grid-cols-[2.75rem_minmax(0,13rem)_1.5rem_7.5rem_minmax(0,1fr)]"
            >
              <span>pid</span>
              <span>user</span>
              <span>s</span>
              <span className="hidden sm:block">cpu%</span>
              <span className="hidden sm:block">command</span>
            </p>
            {/* Held at the full table's height, so filtering never resizes
                the window — a terminal does not shrink when grep finds less,
                and the sections below must not jump. Rows are 2rem from `sm`
                up, two lines (3.5rem) on a phone. */}
            <ul
              aria-label="Tentor"
              className="min-h-[calc(var(--phone-rows)*3.5rem+2.75rem)] py-1 sm:min-h-[calc(var(--rows)*2rem+0.5rem)]"
              style={{ '--rows': rows.length, '--phone-rows': Math.min(rows.length, PHONE_ROWS) } as React.CSSProperties}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map((row, position) => (
                  <Row
                    key={row.id}
                    row={row}
                    live={live}
                    active={preview?.id === row.id && hoverId !== null}
                    dimmed={!demoMatch(row)}
                    wideOnly={!needle && position >= PHONE_ROWS}
                    onHover={() => setHoverId(row.id)}
                  />
                ))}
              </AnimatePresence>
              {!needle && shown.length > PHONE_ROWS ? (
                <li className="px-3 py-2 text-[12px] text-muted sm:hidden">
                  <span className="text-accent-fg">+{shown.length - PHONE_ROWS}</span> lainnya — ketik di grep untuk mencari
                </li>
              ) : null}
              {shown.length === 0 ? (
                <li className="px-3 py-3 text-[12px] text-muted">
                  <span className="text-accent-fg">grep:</span> tidak ada tentor yang cocok dengan “{needle}”
                </li>
              ) : null}
            </ul>
          </div>

          {/* The hovered (or first running) tentor. */}
          <aside aria-hidden className="hidden border-l-2 border-line-soft p-4 lg:block">
            {preview ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={preview.id}
                  initial={live ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={live ? { opacity: 0, y: -6, transition: { duration: 0.1 } } : undefined}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="sticky top-24 group/window"
                >
                  <DitherImage
                    src={preview.foto}
                    alt=""
                    width={PORTRAIT.width}
                    height={PORTRAIT.height}
                    sizes="240px"
                    reveal
                    className="aspect-[4/5] w-full"
                  />
                  <p className="mt-4 text-[10px] tracking-[0.14em] text-accent-fg uppercase">
                    pid {preview.pid} · {STAT_TEXT[preview.stat]}
                  </p>
                  <p className="mt-1 text-base leading-6 font-bold text-fg">{preview.nama}</p>
                  <ul className="mt-3 space-y-0.5 text-[12px] leading-5 text-muted">
                    {preview.modul.length > 0 ? preview.modul.map((label) => <li key={label}>{label}</li>) : <li>belum ditugaskan ke modul</li>}
                  </ul>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </aside>
        </div>

        {/* Function-key bar. */}
        <p aria-hidden className="flex flex-wrap gap-x-4 gap-y-1 border-t-2 border-line-soft px-3 py-2 text-[11px] leading-5">
          {[
            ['Tab', 'pilih'],
            ['⏎', 'buka profil'],
            ['R', 'mengajar'],
            ['S', 'menunggu'],
            ['Z', 'selesai'],
          ].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1">
              <span className="bg-surface-2 px-1 font-bold text-accent-fg">{key}</span>
              <span className="text-muted">{label}</span>
            </span>
          ))}
        </p>
      </TerminalWindow>
    </div>
  )
}
