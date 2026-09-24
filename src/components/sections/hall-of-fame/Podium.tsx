'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

import { CALM, INSTANT, REVEAL_VIEWPORT, mech } from '@/components/motion/variants'
import { DitherImage } from '@/components/ui/DitherImage'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { PORTRAIT } from '@/lib/types'
import { cn } from '@/lib/utils'

export type PodiumEntry = {
  rank: number
  slug: string
  nama: string
  foto: string
  angkatan: number
  totalMenang: number
  streak: number
}

/** Step heights, visual order, and the order the blocks rise in: bronze first. */
type Place = { block: string; order: string; delay: number }

const PLACE: Record<number, Place> = {
  1: { block: 'h-32 sm:h-44', order: 'order-2', delay: 0.3 },
  2: { block: 'h-24 sm:h-32', order: 'order-1', delay: 0.15 },
  3: { block: 'h-16 sm:h-24', order: 'order-3', delay: 0 },
}

const FALLBACK_PLACE: Place = { block: 'h-16 sm:h-24', order: 'order-3', delay: 0 }

/**
 * The three most decorated members on a podium. In the DOM they run first to
 * third, which is the order a screen reader should hear; CSS `order` stands
 * them second-first-third, which is how a podium looks.
 *
 * The steps rise (`scaleY` from the floor) third, second, first when the
 * podium scrolls into view, then each person drops into place above theirs.
 * Reduced motion shows the finished podium.
 */
export function Podium({ entries }: { entries: readonly PodiumEntry[] }) {
  const ref = useRef<HTMLOListElement>(null)
  const inView = useInView(ref, REVEAL_VIEWPORT)
  const mode = useMotionMode()

  const shown = inView && mode !== 'pending'
  const reduced = mode === 'reduced'

  return (
    <ol ref={ref} aria-label="Tiga besar" className="mx-auto grid max-w-4xl grid-cols-3 items-end gap-2 sm:gap-6">
      {entries.slice(0, 3).map((entry) => {
        const place = PLACE[entry.rank] ?? FALLBACK_PLACE

        return (
          <li key={entry.slug} className={cn('flex min-w-0 flex-col', place.order)}>
            <motion.div
              data-reveal
              className="group relative text-center"
              initial={{ opacity: 0, y: reduced ? 0 : -12 }}
              animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : -12 }}
              transition={reduced ? CALM : mech(0.45, place.delay + 0.45)}
            >
              <DitherImage
                src={entry.foto}
                alt={`Potret ${entry.nama}`}
                width={PORTRAIT.width}
                height={PORTRAIT.height}
                sizes="(min-width: 640px) 200px, 30vw"
                className="mx-auto aspect-[4/5] w-full max-w-[12rem] motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-y-1"
              />
              <p className="mt-3 text-xs leading-5 font-bold text-fg sm:text-sm">
                <Link
                  href={`/hall-of-fame/${entry.slug}`}
                  className="decoration-accent-fg decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
                >
                  {entry.nama}
                </Link>
              </p>
              <p className="mt-1 text-[10px] leading-4 text-dim sm:text-[11px]">
                {entry.totalMenang}× menang · streak {entry.streak}
              </p>
            </motion.div>

            <motion.div
              data-reveal
              aria-hidden
              className={cn(
                'mt-4 flex origin-bottom items-start justify-center border-2 border-line bg-accent pt-3',
                place.block,
              )}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: shown ? 1 : 0 }}
              transition={reduced ? INSTANT : mech(0.55, place.delay)}
            >
              <span className="font-display text-2xl leading-none text-accent-ink sm:text-4xl">{entry.rank}</span>
            </motion.div>
          </li>
        )
      })}
    </ol>
  )
}
