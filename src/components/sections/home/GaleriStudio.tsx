'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls, useInView } from 'motion/react'
import type { PanInfo } from 'motion/react'

import { PrintSheet } from '@/components/sections/galeri/PrintSheet'
import { komboLine } from '@/lib/creator'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import type { GalleryItem } from '@/lib/types'
import { cn } from '@/lib/utils'

// ------------------------------------------------------------- timings ---

/** A new window opens this often (ms) while nobody is using the desktop. */
const OPEN_EVERY = 2600
const MAX_WINDOWS = 5
/** Idle this long (ms), and the desktop sends a window to the printer itself. */
const AUTO_PRINT_EVERY = 7000
/** Seconds the head takes to print a sheet, and the pause after tearing. */
const PRINT = 3
const REST = 1.2
const PILE_MAX = 7
/** How long a window takes to fly into the printer (ms). */
const FLY = 450

// --------------------------------------------------------------- types ---

type Win = {
  key: number
  item: GalleryItem
  x: number
  y: number
  z: number
  w: number
  /** Set while the window flies into the printer: the offset to travel. */
  fly?: { dx: number; dy: number }
}

type Job = { key: number; item: GalleryItem }
type Printer = { printing: Job | null; queue: Job[]; phase: 'print' | 'tear' }
type Printed = Job & { rotate: number; x: number; y: number }

const scatter = () => ({ rotate: -10 + Math.random() * 20, x: -24 + Math.random() * 48, y: -28 + Math.random() * 56 })

// ------------------------------------------------------------- windows ---

type WindowProps = {
  win: Win
  live: boolean
  active: boolean
  deskRef: React.RefObject<HTMLDivElement | null>
  onRaise: () => void
  onClose: () => void
  onPrint: () => void
  onDrag: (info: PanInfo) => void
  onDrop: (info: PanInfo) => void
}

/** One photo window. Dragged by its title bar only, so the photo stays a link. */
function DesktopWindow({ win, live, active, deskRef, onRaise, onClose, onPrint, onDrag, onDrop }: WindowProps) {
  const controls = useDragControls()
  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={deskRef}
      dragElastic={0.08}
      onDrag={(_, info) => onDrag(info)}
      onDragEnd={(_, info) => onDrop(info)}
      onPointerDown={onRaise}
      className="absolute"
      style={{ left: win.x, top: win.y, width: win.w, zIndex: win.z }}
      initial={live ? { scale: 0.55, opacity: 0 } : false}
      animate={
        win.fly
          ? { x: win.fly.dx, y: win.fly.dy, scale: 0.15, opacity: 0, rotate: 8, transition: { duration: FLY / 1000, ease: [0.5, 0, 0.75, 0] } }
          : { scale: 1, opacity: 1 }
      }
      exit={live ? { scale: 0.7, opacity: 0, transition: { duration: 0.14 } } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <div
        className={cn(
          'border-2 bg-surface',
          active ? 'border-accent shadow-[6px_6px_0_0_var(--accent)]' : 'border-line shadow-[4px_4px_0_0_rgb(0_0_0/0.5)]',
        )}
      >
        <div
          onPointerDown={(event) => controls.start(event)}
          className={cn(
            'flex cursor-grab touch-none items-center gap-2 px-2 py-1 text-[11px] select-none active:cursor-grabbing',
            active ? 'bg-accent text-canvas' : 'bg-surface-2 text-muted',
          )}
        >
          <span className="min-w-0 flex-1 truncate">~/galeri/{win.item.id}.jpg</span>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onPrint}
            aria-label={`Cetak ${win.item.caption || win.item.alt}`}
            className="shrink-0 font-bold hover:opacity-70"
          >
            [⎙]
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
            aria-label="Tutup jendela"
            className="shrink-0 font-bold hover:opacity-70"
          >
            [×]
          </button>
        </div>
        <Link href={`/galeri#${win.item.id}`} className="relative block aspect-[4/3] bg-surface-2" draggable={false}>
          <Image src={win.item.src} alt={win.item.alt} fill sizes="330px" className="object-cover" draggable={false} />
        </Link>
        <p className="truncate border-t-2 border-line-soft px-2 py-1 text-[10px] text-muted">{win.item.caption || win.item.alt}</p>
      </div>
    </motion.div>
  )
}

function Clock() {
  const [now, setNow] = useState('')
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }))
    const first = window.setTimeout(tick, 0)
    const timer = window.setInterval(tick, 10_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [])
  return <span className="tabular-nums">{now}</span>
}

// -------------------------------------------------------------- studio ---

/**
 * The gallery as a desk: a 90s desktop on the monitor, a dot-matrix printer
 * beside it, and a loose pile of prints in front.
 *
 * Photos open themselves as windows. Drag one onto the printer — or press its
 * [⎙] — and it flies in, prints line by line, tears off and drops onto the
 * pile. Left alone, the desktop sends a window to the printer every few
 * seconds itself. Several jobs queue. Prints link to the photo in /galeri;
 * the pile can be shuffled.
 *
 * Everything automatic stops off-screen, while the pointer is on the desktop,
 * and under reduced motion (where windows and prints appear without motion
 * and nothing happens on its own).
 */
export function GaleriStudio({ items }: { items: readonly GalleryItem[] }) {
  const mode = useMotionMode()
  const live = mode === 'full'
  const rootRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const printerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.25 })

  const [wins, setWins] = useState<Win[]>([])
  const [readme, setReadme] = useState(false)
  const [readmeZ, setReadmeZ] = useState(1)
  const [hovering, setHovering] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [printer, setPrinter] = useState<Printer>({ printing: null, queue: [], phase: 'print' })
  const [pile, setPile] = useState<Printed[]>([])
  const nextItem = useRef(0)
  const nextKey = useRef(0)
  const topZ = useRef(1)

  const automatic = live && inView && items.length > 0

  // Timers read the latest windows and printer through these, not stale closures.
  const winsRef = useRef(wins)
  const printerBusy = useRef(false)
  useEffect(() => {
    winsRef.current = wins
    printerBusy.current = printer.printing !== null
  })

  // ---- windows
  const open = (): void => {
    const desk = deskRef.current
    const item = items[nextItem.current % Math.max(items.length, 1)]
    if (!desk || !item) return
    nextItem.current += 1
    nextKey.current += 1
    topZ.current += 1
    const { width, height } = desk.getBoundingClientRect()
    const w = Math.min(width - 32, Math.round((width < 520 ? 180 : 220) + Math.random() * 100))
    const h = w * 0.75 + 64
    const win: Win = {
      key: nextKey.current,
      item,
      w,
      x: Math.round(16 + Math.random() * Math.max(0, width - w - 32)),
      y: Math.round(24 + Math.random() * Math.max(0, height - h - 48)),
      z: topZ.current,
    }
    setWins((current) => [...current, win].slice(-MAX_WINDOWS))
  }

  const raise = (key: number): void => {
    topZ.current += 1
    const z = topZ.current
    setWins((current) => current.map((win) => (win.key === key ? { ...win, z } : win)))
  }
  const close = (key: number): void => setWins((current) => current.filter((win) => win.key !== key))

  // ---- printing
  const enqueue = (item: GalleryItem): void => {
    nextKey.current += 1
    const job = { key: nextKey.current, item }
    setPrinter((state) => (state.printing ? { ...state, queue: [...state.queue, job] } : { printing: job, queue: state.queue, phase: 'print' }))
  }

  /** Fly a window into the printer, then queue its photo. */
  const sendToPrinter = (key: number): void => {
    const win = winsRef.current.find((candidate) => candidate.key === key)
    const desk = deskRef.current?.getBoundingClientRect()
    const slot = printerRef.current?.getBoundingClientRect()
    if (!win || win.fly) return
    const dx = desk && slot ? slot.left + slot.width / 2 - (desk.left + win.x + win.w / 2) : 0
    const dy = desk && slot ? slot.top + 24 - (desk.top + win.y + 40) : 0
    setWins((current) => current.map((candidate) => (candidate.key === key ? { ...candidate, fly: { dx, dy } } : candidate)))
    window.setTimeout(
      () => {
        close(key)
        enqueue(win.item)
      },
      live ? FLY : 0,
    )
  }

  const overPrinter = (info: PanInfo): boolean => {
    const slot = printerRef.current?.getBoundingClientRect()
    if (!slot) return false
    const x = info.point.x - window.scrollX
    const y = info.point.y - window.scrollY
    return x >= slot.left - 24 && x <= slot.right + 24 && y >= slot.top - 24 && y <= slot.bottom + 24
  }

  // One job at a time: print, tear, drop onto the pile, start the next.
  const job = printer.printing
  useEffect(() => {
    if (!job) return
    const print = live ? PRINT * 1000 : 0
    const rest = live ? REST * 1000 : 200
    const timers = [
      window.setTimeout(() => setPrinter((state) => ({ ...state, phase: 'tear' })), print + 300),
      window.setTimeout(() => {
        setPile((current) => [...current, { ...job, ...scatter() }].slice(-PILE_MAX))
        setPrinter((state) => ({ printing: state.queue[0] ?? null, queue: state.queue.slice(1), phase: 'print' }))
      }, print + rest + 300),
    ]
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [job, live])

  // ---- the desktop running by itself
  const idle = automatic && !hovering
  useEffect(() => {
    if (!idle) return
    const first = window.setTimeout(open, 300)
    const timer = window.setInterval(open, OPEN_EVERY)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
    // `open` reads refs and `items` only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idle, items])

  useEffect(() => {
    if (!idle) return
    const timer = window.setInterval(() => {
      if (printerBusy.current) return
      const oldest = winsRef.current.find((win) => !win.fly)
      if (oldest) sendToPrinter(oldest.key)
    }, AUTO_PRINT_EVERY)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idle])

  const focused = wins.reduce<Win | undefined>((top, win) => (!top || win.z > top.z ? win : top), undefined)
  const printing = printer.printing
  const status = printing ? (printer.phase === 'print' ? 'printing' : 'feeding') : dragOver ? 'lepas di sini' : 'ready'

  return (
    <div ref={rootRef} className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-10">
      {/* ---------------------------------------------------- monitor */}
      <div data-palette="dark" data-accent="violet" className="border-2 border-line shadow-[6px_6px_0_0_var(--color-ink)]">
        <div className="flex items-center justify-between border-b-2 border-line bg-surface px-3 py-1.5 text-[11px] leading-5">
          <span className="font-display tracking-[0.14em] text-accent-fg">ksp-wm</span>
          <span className="text-muted">
            {wins.length} jendela · <Clock />
          </span>
        </div>

        <div
          ref={deskRef}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          className="relative h-[26rem] overflow-hidden bg-canvas dot-grid sm:h-[32rem]"
        >
          <ul className="absolute top-4 left-4 z-[1] flex flex-col gap-4 text-center text-[10px] text-muted">
            {['galeri/', 'kelas/', 'workshop/'].map((label) => (
              <li key={label} aria-hidden className="hidden w-16 flex-col items-center gap-1 sm:flex">
                <span className="block h-9 w-11 border-2 border-line bg-accent/70" />
                {label}
              </li>
            ))}
            {/* The first easter egg: everything else about the builder starts here. */}
            <li className="w-16">
              <button
                type="button"
                onClick={() => {
                  setReadme(true)
                  topZ.current += 1
                  setReadmeZ(topZ.current)
                }}
                className="group flex w-16 cursor-pointer flex-col items-center gap-1 text-muted hover:text-accent-fg focus-visible:text-accent-fg"
              >
                <span className="block h-9 w-11 border-2 border-line bg-surface-2 group-hover:border-accent" />
                README
              </button>
            </li>
          </ul>

          <AnimatePresence>
            {readme ? (
              <motion.div
                key="readme"
                role="dialog"
                aria-label="README"
                className="absolute top-10 left-20 w-[min(19rem,calc(100%-6rem))] border-2 border-accent bg-surface shadow-[6px_6px_0_0_var(--accent)] sm:left-28"
                style={{ zIndex: readmeZ }}
                initial={live ? { scale: 0.4, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                exit={live ? { scale: 0.6, opacity: 0, transition: { duration: 0.12 } } : undefined}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              >
                <div className="flex items-center justify-between bg-accent px-2 py-1 text-[11px] text-canvas">
                  <span>~/README</span>
                  <button type="button" onClick={() => setReadme(false)} aria-label="Tutup README" className="font-bold hover:opacity-70">
                    [×]
                  </button>
                </div>
                <div className="px-3 py-3 font-mono text-[13px] leading-6 text-fg">
                  <p>oops, can you find me?</p>
                  <p className="text-accent-fg">hehehe</p>
                  <p className="mt-3 text-[11px] leading-5 text-dim">
                    {'// petunjuk pertama: ketik sesuatu yang menanyakan siapa kamu.'}
                  </p>
                  <p className="text-[11px] leading-5 text-accent-fg">{komboLine(1)}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <p aria-hidden className="absolute right-4 bottom-3 text-right text-[10px] leading-4 text-dim">
            seret jendela ke printer →
            <br />
            atau tekan [⎙]
          </p>

          <AnimatePresence>
            {wins.map((win) => (
              <DesktopWindow
                key={win.key}
                win={win}
                live={live}
                active={focused?.key === win.key}
                deskRef={deskRef}
                onRaise={() => raise(win.key)}
                onClose={() => close(win.key)}
                onPrint={() => sendToPrinter(win.key)}
                onDrag={(info) => setDragOver(overPrinter(info))}
                onDrop={(info) => {
                  setDragOver(false)
                  if (overPrinter(info)) sendToPrinter(win.key)
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 overflow-x-auto border-t-2 border-line bg-surface px-2 py-1.5">
          <button type="button" onClick={open} className="h-7 shrink-0 border-2 border-line bg-accent px-2 text-[11px] font-bold text-canvas">
            + buka
          </button>
          {wins.map((win) => (
            <button
              key={win.key}
              type="button"
              onClick={() => raise(win.key)}
              className={cn(
                'h-7 max-w-40 shrink-0 truncate border-2 px-2 text-[11px]',
                focused?.key === win.key ? 'border-accent text-accent-fg' : 'border-line-soft text-muted',
              )}
            >
              {win.item.id}.jpg
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- printer */}
      <div className="mx-auto w-full max-w-[23rem]">
        <div
          ref={printerRef}
          data-palette="dark"
          data-accent="magenta"
          className={cn(
            'relative z-10 border-2 bg-surface px-4 pt-3 pb-4 shadow-[6px_6px_0_0_var(--color-ink)] transition-colors',
            dragOver ? 'border-accent' : 'border-line',
          )}
        >
          <div className="flex items-center justify-between text-[10px] leading-4 tracking-[0.14em] text-muted uppercase">
            <span className="font-display text-accent-fg">KSP-9 dot matrix</span>
            <span className="flex items-center gap-1.5">
              <span className={cn('inline-block h-2 w-2 bg-accent', printing && 'rec-blink')} />
              {status}
            </span>
          </div>
          {/* The slot, with the head shuttling above it. */}
          <div className={cn('relative mt-4 h-3 border-2 bg-[#07080a]', dragOver ? 'border-accent' : 'border-line')}>
            {live && printing && printer.phase === 'print' ? (
              <motion.span
                className="absolute -top-2 h-5 w-5 border-2 border-line bg-accent"
                animate={{ x: [0, 300, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
              />
            ) : null}
          </div>
          <p className="mt-3 text-[10px] leading-4 text-dim">
            {printer.queue.length > 0 ? `queue: ${printer.queue.length} menunggu` : dragOver ? 'lepas untuk mencetak' : 'seret foto ke sini'}
          </p>
        </div>

        {/* The sheet coming out, laid over the top of the pile like paper
            feeding onto the desk. Zero height: printing never moves anything. */}
        <div className="relative z-40 -mt-1 h-0 px-3">
          <AnimatePresence mode="wait">
            {printing ? (
              <motion.div
                key={printing.key}
                className="absolute inset-x-3 top-0"
                initial={live ? { clipPath: 'inset(0 0 100% 0)' } : false}
                animate={
                  printer.phase === 'print'
                    ? { clipPath: 'inset(0 0 0% 0)', y: 0, rotate: 0, opacity: 1 }
                    : { clipPath: 'inset(0 0 0% 0)', y: 80, rotate: 5, opacity: 0 }
                }
                transition={
                  printer.phase === 'print'
                    ? // Line by line: the sheet is revealed in 24 hard steps.
                      { clipPath: { duration: PRINT, ease: (t: number) => Math.floor(t * 24) / 24 } }
                    : { duration: 0.45, ease: [0.5, 0, 0.75, 0] }
                }
              >
                <PrintSheet item={printing.item} sizes="340px" describe={false} />
                <div
                  aria-hidden
                  className="h-2 bg-[linear-gradient(135deg,#fbf8ee_50%,transparent_50%),linear-gradient(225deg,#fbf8ee_50%,transparent_50%)] bg-[length:10px_8px]"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* The pile, and what is on it. */}
        <div className="relative mt-4 h-[26rem]">
          <AnimatePresence>
            {pile.map((print, position) => (
              <motion.div
                key={print.key}
                className="absolute top-1/2 left-1/2 w-72"
                style={{ zIndex: position }}
                initial={live ? { opacity: 0, x: '-50%', y: '-160%', rotate: 0 } : false}
                animate={{ opacity: 1, x: `calc(-50% + ${print.x}px)`, y: `calc(-50% + ${print.y}px)`, rotate: print.rotate }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 50 }}
              >
                <Link href={`/galeri#${print.item.id}`} className="block">
                  <PrintSheet item={print.item} sizes="300px" className="shadow-[3px_4px_0_0_rgb(0_0_0/0.18)]" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
          {pile.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center text-center text-[12px] leading-5 text-muted">
              meja masih kosong —
              <br />
              cetak foto pertama
            </p>
          ) : null}
        </div>
        <div className="relative z-[60] mt-2 flex h-7 items-center justify-between">
          <p className="text-[11px] tracking-[0.12em] text-dim uppercase">{`// hasil cetak (${pile.length})`}</p>
          {pile.length > 1 ? (
            <button
              type="button"
              onClick={() => setPile((current) => current.map((print) => ({ ...print, ...scatter() })))}
              className="h-7 border-2 border-line bg-surface px-2 text-[11px] text-fg hover:border-accent hover:text-accent-fg"
            >
              shuffle
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
