'use client'

import { motion } from 'motion/react'
import type { Variants } from 'motion/react'

import { Typewriter } from '@/components/motion/Typewriter'
import { CALM, INSTANT, enterLabel, mech } from '@/components/motion/variants'
import {
  HERO_CHAR_DELAY,
  HERO_RASTER_BANDS,
  HERO_RASTER_STAGGER,
  HERO_START,
  heroTimeline,
} from '@/components/sections/home/hero-timeline'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'

/** Each beat after the prompt: a short rise into place, on its own delay. */
const beat: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: mech(0.5, delay) }),
  calm: { opacity: 1, y: 0, transition: CALM },
}

const rasterGroup: Variants = {
  hidden: {},
  show: (delay: number) => ({
    transition: { delayChildren: delay, staggerChildren: HERO_RASTER_STAGGER },
  }),
}

/** A band of the mask sliding off to the right, its leading edge lit. */
const rasterBand: Variants = {
  hidden: { x: '0%' },
  show: { x: '101%', transition: mech(0.5) },
}

/**
 * The lit edge only exists while its band is moving. Parked, six stacked
 * edges read as a second, giant cursor beside the real one. Motion hands a
 * child its parent's delay, so this switches on the instant the band starts.
 */
const rasterEdge: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: INSTANT },
}

/**
 * The wordmark's mask: six bands in the terminal's own background colour,
 * sliding off one after another, top to bottom, each with a lit leading edge —
 * so the name appears to be drawn raster line by raster line.
 *
 * The wordmark itself is never hidden. It is painted, at full opacity, from
 * the first frame; the bands merely sit on top of it. That keeps it the
 * page's Largest Contentful Paint at first paint instead of whenever the
 * entrance finishes, and it is why the bands must match the background
 * exactly. Reduced motion never renders them — and before hydration the
 * `motion-reduce` class hides them, so nobody waits on JavaScript to read the
 * name.
 */
function RasterMask({ delay }: { delay: number }) {
  return (
    <motion.span
      aria-hidden
      data-raster
      custom={delay}
      variants={rasterGroup}
      className="pointer-events-none absolute -inset-y-[0.12em] left-0 -right-[0.12em] flex flex-col overflow-hidden motion-reduce:hidden"
    >
      {Array.from({ length: HERO_RASTER_BANDS }, (_, index) => (
        <motion.span key={index} variants={rasterBand} className="relative block flex-1 bg-canvas">
          <motion.span variants={rasterEdge} className="absolute inset-y-0 left-0 w-[3px] bg-accent" />
        </motion.span>
      ))}
    </motion.span>
  )
}

type HeroSequenceProps = {
  /** Typed at the prompt, without the `$`. */
  command: string
  wordmark: string
  name: string
  tagline: string
  actions: React.ReactNode
  /** The stats strip pinned to the bottom of the window. */
  footer: React.ReactNode
  /** Rendered behind the text: the drifting token field. */
  backdrop?: React.ReactNode
  /** The right-hand column from `lg` up; under the buttons below it. */
  aside?: React.ReactNode
  /** A few lines of facts printed under the buttons. */
  status?: React.ReactNode
}

/**
 * The hero's entrance: prompt types itself → the name renders → tagline →
 * buttons → stats. One timeline (`heroTimeline`) drives every beat through
 * variant delays; there is no chain of timeouts and nothing to cancel.
 *
 * The whole sequence holds at `hidden` until the motion preference resolves
 * right after hydration, then starts once — as `show`, or as `calm`, where
 * every beat fades in together in 140ms and the raster mask never renders.
 */
export function HeroSequence({
  command,
  wordmark,
  name,
  tagline,
  actions,
  footer,
  backdrop,
  aside,
  status,
}: HeroSequenceProps) {
  const mode = useMotionMode()
  const timeline = heroTimeline(command)

  return (
    <motion.div initial="hidden" animate={enterLabel(mode)} className="flex flex-1 flex-col">
      <div className="relative grid flex-1 grid-cols-1 items-center gap-10 px-4 py-8 sm:px-8 sm:py-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 lg:py-12 lg:pr-10 lg:pl-8 xl:gap-32 short:lg:py-6">
        {backdrop}

        <div className="relative flex min-w-0 flex-col justify-center">
          <p aria-hidden className="text-[clamp(0.5625rem,2.9vw,0.8125rem)] leading-6 text-muted">
            <span className="text-accent-fg">$</span>{' '}
            <Typewriter
              text={command}
              charDelay={HERO_CHAR_DELAY}
              startDelay={HERO_START}
              cursor
              maskClassName="bg-canvas"
            />
          </p>

          <h1 id="hero-title" className="mt-8 sm:mt-12 short:lg:mt-6">
            <span className="relative block w-fit">
              <span className="block font-display text-[clamp(4.5rem,24vw,11rem)] lg:text-[clamp(11rem,14vw,16rem)] short:lg:text-[clamp(7rem,10vw,11rem)] leading-[0.85] tracking-[0.02em] text-fg">
                {wordmark}
              </span>
              {mode === 'reduced' ? null : <RasterMask delay={timeline.raster} />}
            </span>

            <motion.span
              data-seq
              custom={timeline.name}
              variants={beat}
              className="mt-5 block font-display text-[clamp(0.6875rem,2.2vw,1.0625rem)] leading-relaxed tracking-[0.2em] text-accent-fg uppercase sm:mt-6 short:lg:mt-4"
            >
              {name}
            </motion.span>
          </h1>

          <motion.p
            data-seq
            custom={timeline.tagline}
            variants={beat}
            className="mt-6 max-w-xl text-sm leading-7 text-fg sm:text-base sm:leading-7 short:lg:mt-3"
          >
            {tagline}
          </motion.p>

          <motion.div
            data-seq
            custom={timeline.actions}
            variants={beat}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap short:lg:mt-5"
          >
            {actions}
          </motion.div>

          {status ? (
            <motion.div data-seq custom={timeline.status} variants={beat} className="mt-10 short:lg:mt-5">
              {status}
            </motion.div>
          ) : null}
        </div>

        {aside ? (
          <motion.div data-seq custom={timeline.aside} variants={beat} className="relative w-full min-w-0">
            {aside}
          </motion.div>
        ) : null}
      </div>

      <motion.div data-seq custom={timeline.footer} variants={beat}>
        {footer}
      </motion.div>
    </motion.div>
  )
}
