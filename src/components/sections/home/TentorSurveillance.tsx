'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'

import { DitherImage } from '@/components/ui/DitherImage'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { pixelPortrait } from '@/lib/pixel-portrait'
import { PORTRAIT } from '@/lib/types'

export type SurveillanceTarget = {
  id: string
  pid: number
  nama: string
  foto: string
  /** Teaching this week: picked more often. */
  running: boolean
  /** The unidentified one (easter egg): glitches, and has no name. */
  ghost?: boolean
}

/** Once every this many ms of watching, someone who is not on the list turns up. */
const GHOST_EVERY = 5 * 60 * 1000

const GHOST_TARGET: SurveillanceTarget = {
  id: 'ghost',
  pid: 2024,
  nama: '??',
  foto: pixelPortrait('?'),
  running: false,
  ghost: true,
}

type Sighting = {
  key: number
  target: SurveillanceTarget
  /** Box of the photo within the field, px. */
  x: number
  y: number
  w: number
  h: number
}

type Box = { left: number; top: number; right: number; bottom: number }

/** A sighting's life on screen, ms. */
const LIFE = 4600
/** How often a new target is looked for, ms. */
const SPAWN_EVERY = 1150
const MAX_ON_SCREEN = 4
/** Room left clear around the content and other sightings, px. */
const GAP = 18
/** Label under the photo, px. */
const LABEL_H = 48
/** Margin from the section's edges (and the scrollbar), px. */
const EDGE = 36

const overlaps = (a: Box, b: Box): boolean =>
  a.left < b.right + GAP && a.right + GAP > b.left && a.top < b.bottom + GAP && a.bottom + GAP > b.top

const shortName = (nama: string): string => {
  const [first = '', second = ''] = nama.split(/\s+/)
  return second ? `${first} ${second.charAt(0)}.` : first
}

const coord = (value: number): string => String(Math.max(0, Math.round(value))).padStart(4, '0')

/** Corner brackets that close in on the target. */
function Brackets() {
  const corner = 'absolute h-6 w-6 border-accent'
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -inset-3.5"
      initial={{ scale: 1.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className={`${corner} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${corner} top-0 right-0 border-t-2 border-r-2`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${corner} right-0 bottom-0 border-r-2 border-b-2`} />
    </motion.span>
  )
}

function SightingView({ sighting, fieldW, fieldH }: { sighting: Sighting; fieldW: number; fieldH: number }) {
  const { x, y, w, h, target } = sighting
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      // Signal lost: a few hard flickers, then gone.
      exit={{ opacity: [1, 0.2, 1, 0, 0.6, 0], transition: { duration: 0.42, times: [0, 0.2, 0.35, 0.55, 0.7, 1] } }}
    >
      {/* Targeting hairlines across the whole section, locking onto the spot. */}
      <motion.span
        className="absolute left-0 h-px bg-accent"
        style={{ top: cy, width: fieldW, transformOrigin: `${cx}px 50%` }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: [0, 0.55, 0.55, 0] }}
        transition={{ scaleX: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 1.5, times: [0, 0.1, 0.55, 1] } }}
      />
      <motion.span
        className="absolute top-0 w-px bg-accent"
        style={{ left: cx, height: fieldH, transformOrigin: `50% ${cy}px` }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: [0, 0.55, 0.55, 0] }}
        transition={{ scaleY: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 1.5, times: [0, 0.1, 0.55, 1] } }}
      />

      <div className="absolute" style={{ left: x, top: y, width: w }}>
        <div className="relative" style={{ height: h }}>
          <Brackets />
          {/* The feed opens top to bottom in bands. */}
          <motion.div
            data-palette="dark"
            // Pinning a palette resets the accent; restate the section's.
            data-accent="cyan"
            className="absolute inset-0 border-2 border-line bg-code-bg"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: 0.5, delay: 0.55, ease: (t: number) => Math.floor(t * 8) / 8 }}
          >
            <DitherImage
              src={target.foto}
              alt=""
              width={PORTRAIT.width}
              height={PORTRAIT.height}
              sizes="250px"
              bordered={false}
              className={target.ghost ? 'ghost-feed h-full w-full' : 'h-full w-full'}
            />
            <span className="absolute inset-0 scanlines opacity-50" />
            <span className="absolute top-2 left-2 flex items-center gap-1.5 text-[11px] leading-none text-accent-fg">
              <span className="rec-blink inline-block h-2 w-2 bg-accent" /> LIVE
            </span>
          </motion.div>
        </div>
        <motion.p
          className="mt-2.5 text-[12px] leading-5 whitespace-nowrap"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.95 }}
        >
          <span className="bg-accent px-1 font-bold text-canvas">TRK-{target.pid}</span>{' '}
          {target.ghost ? (
            <span className="glitch glitch-sharp font-bold text-fg" data-text="??">
              ??
            </span>
          ) : (
            <span className="text-fg">{shortName(target.nama)}</span>
          )}
          <br />
          <span className="text-dim tabular-nums">
            {target.ghost ? 'x:▒▒▒▒ y:▒▒▒▒ · tidak terdaftar' : `x:${coord(cx)} y:${coord(cy)} ${target.running ? '· mengajar' : ''}`}
          </span>
        </motion.p>
      </div>
    </motion.div>
  )
}

/**
 * "God's eye" over the tentor section: in whatever empty space the section
 * has — the wide margins of a big screen, the gap beside the heading —
 * tentors are sighted one at a time: hairlines sweep across and lock on,
 * brackets close in, the feed opens, a tracking label prints, and after a few
 * seconds the signal drops. It never lands on the heading or the `htop`
 * window (anything marked `data-surveil-avoid`), so on a narrow screen with
 * no free space it simply never fires.
 *
 * Pure decoration, hidden from assistive tech, and absent entirely under
 * reduced motion. It only runs while the section is on screen.
 */
export function TentorSurveillance({ targets }: { targets: readonly SurveillanceTarget[] }) {
  const mode = useMotionMode()
  const fieldRef = useRef<HTMLDivElement>(null)
  const inView = useInView(fieldRef, { amount: 0.15 })
  const [sightings, setSightings] = useState<Sighting[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const counter = useRef(0)
  const sightingsRef = useRef<Sighting[]>([])
  const recent = useRef<string[]>([])
  /** When the ghost last showed; starts somewhere in the past so the first comes within 5 minutes. */
  const ghostAt = useRef(0)

  const running = mode === 'full' && inView && targets.length > 0

  useEffect(() => {
    if (!running) return
    const field = fieldRef.current
    const section = field?.parentElement
    if (!field || !section) return

    const spawn = (): void => {
      if (document.hidden) return
      const frame = field.getBoundingClientRect()
      setSize({ w: frame.width, h: frame.height })
      const avoid: Box[] = [...section.querySelectorAll('[data-surveil-avoid]')].map((element) => {
        const rect = element.getBoundingClientRect()
        return { left: rect.left - frame.left, top: rect.top - frame.top, right: rect.right - frame.left, bottom: rect.bottom - frame.top }
      })

      // Decided out here, not inside a state updater: updaters must be pure
      // (React runs them twice in development), and this one moves refs.
      const current = sightingsRef.current
      if (current.length >= MAX_ON_SCREEN) return
      const taken: Box[] = current.map((s) => ({ left: s.x, top: s.y, right: s.x + s.w, bottom: s.y + s.h + LABEL_H }))

      // Someone not seen lately; whoever is teaching this week turns up more.
      const pool = targets.filter((target) => !recent.current.includes(target.id))
      const weighted = [...pool, ...pool.filter((target) => target.running), ...pool.filter((target) => target.running)]
      const now = Date.now()
      if (ghostAt.current === 0) ghostAt.current = now - Math.random() * GHOST_EVERY
      const ghostDue = now - ghostAt.current >= GHOST_EVERY && !current.some((s) => s.target.ghost)
      const target = ghostDue ? GHOST_TARGET : (weighted[Math.floor(Math.random() * weighted.length)] ?? targets[0])
      if (!target) return

      for (let attempt = 0; attempt < 60; attempt += 1) {
        const w = Math.round(160 + Math.random() * 90)
        const h = Math.round(w * (PORTRAIT.height / PORTRAIT.width))
        // Clear of the edges by more than the brackets reach out (14px).
        const x = EDGE + Math.random() * (frame.width - w - 2 * EDGE)
        const y = EDGE + Math.random() * (frame.height - h - LABEL_H - 2 * EDGE)
        const box = { left: x, top: y, right: x + w, bottom: y + h + LABEL_H }
        if (box.right > frame.width - EDGE || box.bottom > frame.height - EDGE) continue
        if ([...avoid, ...taken].some((other) => overlaps(box, other))) continue

        if (target.ghost) ghostAt.current = now
        else recent.current = [...recent.current, target.id].slice(-Math.min(8, Math.max(1, targets.length - 1)))
        counter.current += 1
        const sighting = { key: counter.current, target, x, y, w, h }
        sightingsRef.current = [...current, sighting]
        setSightings(sightingsRef.current)
        window.setTimeout(() => {
          sightingsRef.current = sightingsRef.current.filter((s) => s.key !== sighting.key)
          setSightings(sightingsRef.current)
        }, LIFE)
        return
      }
    }

    const first = window.setTimeout(spawn, 400)
    const timer = window.setInterval(spawn, SPAWN_EVERY)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [running, targets])

  // The field is always in the DOM, even before the motion preference is
  // known: `useInView` observes whatever the ref held on its first run, and
  // a field mounted later would never be seen.
  return (
    <div
      ref={fieldRef}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden"
    >
      <AnimatePresence>
        {running
          ? sightings.map((sighting) => <SightingView key={sighting.key} sighting={sighting} fieldW={size.w} fieldH={size.h} />)
          : null}
      </AnimatePresence>
    </div>
  )
}
