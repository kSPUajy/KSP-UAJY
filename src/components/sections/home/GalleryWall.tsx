'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'

import { Typewriter } from '@/components/motion/Typewriter'
import { DitherImage } from '@/components/ui/DitherImage'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import type { GalleryItem } from '@/lib/types'
import { cn, pad2 } from '@/lib/utils'

type GalleryWallProps = {
  /** Newest first. The wall cycles through all of them. */
  items: readonly GalleryItem[]
}

/**
 * Where each small monitor sits on the 12-column wall from `lg` up. With the
 * main screen first, auto-placement packs them into a bento: one tall
 * monitor beside the main screen, two short ones under it, three across the
 * bottom. Below `lg` the wall is two columns of four monitors; the last two are dropped.
 */
const SLOTS = [
  'lg:col-span-5 lg:row-span-2',
  'lg:col-span-3 lg:row-span-2',
  'lg:col-span-2 lg:row-span-2',
  'lg:col-span-4 lg:row-span-2',
  'hidden lg:block lg:col-span-4 lg:row-span-2',
  'hidden lg:block lg:col-span-4 lg:row-span-2',
] as const

/** Seconds between channel changes somewhere on the wall. */
const TICK = 1.7
/** Every this many ticks, the main screen changes too. */
const MAIN_EVERY = 4

const formatStamp = (iso: string): string => iso.replaceAll('-', '.')

/** A CRT switching channel: the picture collapses to a line, static shows, the next one blooms back. */
const CRT = {
  initial: { scaleY: 0.004, scaleX: 0.7, opacity: 1, filter: 'brightness(4)' },
  animate: {
    scaleY: 1,
    scaleX: 1,
    opacity: 1,
    filter: 'brightness(1)',
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const, delay: 0.16 },
  },
  exit: {
    scaleY: 0.004,
    scaleX: 0.9,
    opacity: 0,
    filter: 'brightness(3)',
    transition: { duration: 0.16, ease: 'easeIn' as const },
  },
}
const STILL = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

type ScreenProps = {
  item: GalleryItem
  channel: number
  animate: boolean
  sizes: string
  main?: boolean
}

/** One monitor: static underneath, the picture on top, the OSD over both. */
function Screen({ item, channel, animate, sizes, main = false }: ScreenProps) {
  const variants = animate ? CRT : STILL
  return (
    <span className="absolute inset-0 block overflow-hidden bg-[#0b0d0a]">
      {/* Static shows whenever the picture is off — between channels. */}
      <span aria-hidden className="tv-static absolute inset-0 opacity-70" />

      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={item.id}
          className="absolute inset-0 block origin-center"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          <DitherImage
            src={item.src}
            alt={main ? item.alt : ''}
            width={item.width}
            height={item.height}
            sizes={sizes}
            bordered={false}
            reveal
            className="h-full w-full"
          />
        </motion.span>
      </AnimatePresence>

      {/* Glass: scanlines, a slow rolling band, dark corners. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 scanlines opacity-60" />
      <span aria-hidden className="tv-roll pointer-events-none absolute inset-0" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/0.55)_100%)]"
      />

      {/* On-screen display. */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-2 left-2.5 font-display leading-none tracking-[0.12em] text-accent-fg [text-shadow:0_0_8px_var(--accent)]',
          main ? 'text-sm sm:text-base' : 'text-[10px]',
        )}
      >
        CH {pad2(channel)}
      </span>
      {item.type === 'video' ? (
        <span aria-hidden className="pointer-events-none absolute top-2 right-2.5 text-[10px] leading-none text-accent-fg">
          ▶ video
        </span>
      ) : null}
      {!main ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-2.5 bottom-2 left-2.5 flex justify-between gap-2 text-[9px] leading-none tracking-[0.1em] text-accent-fg/80 uppercase"
        >
          <span className="truncate">{item.kategori}</span>
          <span className="tabular-nums">{formatStamp(item.tanggal)}</span>
        </span>
      ) : null}
    </span>
  )
}

/**
 * KSP.TV: the gallery as a wall of CRT monitors in a control room. One main
 * screen, six small ones; every couple of seconds one of them switches
 * channel — collapse to a line, a burst of static, the next photo blooms in.
 * Pick a small monitor to put it on the main screen, where its caption is
 * typed out beneath.
 *
 * Photos show in the section's phosphor green and come back in their own
 * colours under the pointer. The cycling stops off-screen, under the pointer,
 * behind the pause button (auto-moving content must be pausable), in a
 * background tab, and entirely under reduced motion.
 */
export function GalleryWall({ items }: GalleryWallProps) {
  const mode = useMotionMode()
  const animate = mode === 'full'
  const wallRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wallRef, { amount: 0.25 })

  const count = SLOTS.length + 1
  // Each screen shows an index into `items`. Start with the newest.
  const [screens, setScreens] = useState<number[]>(() =>
    Array.from({ length: Math.min(count, items.length) }, (_, index) => index),
  )
  const nextRef = useRef(Math.min(count, items.length))
  const tickRef = useRef(0)
  const [paused, setPaused] = useState(false)
  const [hovering, setHovering] = useState(false)

  /** The next photo no screen is showing, round-robin through the pool. */
  const takeNext = useCallback(
    (showing: readonly number[]): number => {
      for (let tries = 0; tries < items.length; tries += 1) {
        const candidate = nextRef.current % items.length
        nextRef.current += 1
        if (!showing.includes(candidate)) return candidate
      }
      return nextRef.current++ % items.length
    },
    [items.length],
  )

  const running = animate && inView && !paused && !hovering && items.length > count

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      if (document.hidden) return
      tickRef.current += 1
      setScreens((current) => {
        const next = [...current]
        const main = tickRef.current % MAIN_EVERY === 0
        const slot = main ? 0 : 1 + Math.floor(Math.random() * (next.length - 1))
        next[slot] = takeNext(next)
        return next
      })
    }, TICK * 1000)
    return () => window.clearInterval(timer)
  }, [running, takeNext])

  /** A small monitor goes to the main screen; the small one tunes to something new. */
  const promote = (slot: number): void => {
    setScreens((current) => {
      const next = [...current]
      const picked = next[slot]
      if (picked === undefined) return current
      next[0] = picked
      next[slot] = takeNext(next)
      return next
    })
  }

  const step = (direction: 1 | -1): void => {
    setScreens((current) => {
      const next = [...current]
      next[0] = ((next[0] ?? 0) + direction + items.length) % items.length
      return next
    })
  }

  const mainIndex = screens[0] ?? 0
  const mainItem = items[mainIndex]
  if (!mainItem) return null

  return (
    <div data-palette="dark" data-accent="lime" className="text-fg">
      {/* Control-room header strip. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-b-0 border-line bg-surface px-3 py-2 text-[11px] leading-5">
        <p className="flex items-center gap-3">
          <span className="font-display tracking-[0.16em] text-accent-fg">KSP.TV</span>
          <span className="text-muted">siaran ulang · {items.length} rekaman</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Channel sebelumnya di layar utama"
            className="h-7 border-2 border-line-soft px-2 text-muted hover:border-accent hover:text-accent-fg"
          >
            ◀ ch
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Channel berikutnya di layar utama"
            className="h-7 border-2 border-line-soft px-2 text-muted hover:border-accent hover:text-accent-fg"
          >
            ch ▶
          </button>
          {animate ? (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              className="ml-2 h-7 border-2 border-line-soft px-2 text-muted hover:border-accent hover:text-accent-fg"
            >
              {paused ? '▶ putar' : '❚❚ jeda'}
              <span className="sr-only"> pergantian otomatis</span>
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={wallRef}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        className="grid grid-flow-dense grid-cols-2 gap-2 border-2 border-line bg-[#07080a] p-2 sm:gap-3 sm:p-3 lg:grid-cols-12 lg:auto-rows-[5.75rem]"
      >
        {/* The main screen. */}
        <div className="col-span-2 lg:col-span-7 lg:row-span-4">
          <Link
            href={`/galeri#${mainItem.id}`}
            className="group/window relative block aspect-video border-2 border-line-soft focus-visible:border-accent lg:aspect-auto lg:h-[calc(100%-3.25rem)]"
          >
            <Screen item={mainItem} channel={mainIndex + 1} animate={animate} sizes="(min-width: 1024px) 56vw, 92vw" main />
            <span aria-hidden className="pointer-events-none absolute top-2 right-2.5 flex items-center gap-1.5 text-[11px] leading-none text-accent-fg">
              <span className="rec-blink inline-block h-2 w-2 bg-accent" /> REC
            </span>
            <span className="sr-only">Buka di galeri</span>
          </Link>
          {/* Caption, typed like a command's output. */}
          <div className="flex h-[3.25rem] items-center gap-2 border-2 border-t-0 border-line-soft bg-canvas px-3 text-[12px] leading-5">
            <span aria-hidden className="shrink-0 text-accent-fg">$</span>
            <span className="min-w-0 flex-1 truncate">
              {animate ? (
                <Typewriter key={mainItem.id} text={mainItem.caption || mainItem.alt} charDelay={0.018} startDelay={0.5} cursor maskClassName="bg-canvas" />
              ) : (
                mainItem.caption || mainItem.alt
              )}
            </span>
            <span aria-hidden className="shrink-0 text-dim tabular-nums">
              {formatStamp(mainItem.tanggal)}
            </span>
          </div>
        </div>

        {/* The small monitors. */}
        {SLOTS.map((slotClass, slotIndex) => {
          const index = screens[slotIndex + 1]
          const item = index === undefined ? undefined : items[index]
          if (!item || index === undefined) return null
          return (
            <button
              key={slotClass + slotIndex}
              type="button"
              onClick={() => promote(slotIndex + 1)}
              aria-label={`Tampilkan di layar utama: ${item.caption || item.alt}`}
              className={cn(
                'group/window relative col-span-1 aspect-[4/3] cursor-pointer border-2 border-line-soft transition-colors hover:border-accent focus-visible:border-accent lg:aspect-auto',
                slotClass,
              )}
            >
              <Screen item={item} channel={index + 1} animate={animate} sizes="(min-width: 1024px) 30vw, 46vw" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
