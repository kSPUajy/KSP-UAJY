'use client'

import { useEffect, useState } from 'react'

import { scrollToTop } from '@/components/motion/SmoothScroll'
import { cn } from '@/lib/utils'

/** How far down, in screen heights, before the button offers itself. */
const AFTER_SCREENS = 1

/** A 7 × 8 pixel arrow, drawn as crisp squares. */
const ARROW = ['...#...', '..###..', '.#####.', '#######', '..###..', '..###..', '..###..', '..###..']

function PixelArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 7 8" shapeRendering="crispEdges" className={className} fill="currentColor">
      {ARROW.flatMap((row, y) =>
        [...row].map((cell, x) => (cell === '#' ? <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" /> : null)),
      )}
    </svg>
  )
}

/**
 * `cd ~` for long pages. A pixel key in the corner that fills from the bottom
 * as you read — the fill and the percentage are how far down the page you
 * are — with an arrow that hops on hover and launches when pressed, before
 * the page glides back to the top. From the keyboard, focus goes to the skip
 * link, so the next Tab starts at the top.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false)
  const [progress, setProgress] = useState(0)
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    let frame = 0
    const check = (): void => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setShown(window.scrollY > window.innerHeight * AFTER_SCREENS)
        setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
      })
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  const percent = Math.round(progress * 100)

  return (
    <button
      type="button"
      onClick={(event) => {
        setLaunching(true)
        window.setTimeout(() => setLaunching(false), 700)
        scrollToTop()
        // Keyboard activation only (a click has a non-zero `detail`): the
        // skip link shows itself on focus, which a mouse user never asked for.
        if (event.detail === 0) {
          document.querySelector<HTMLElement>('a[href="#konten-utama"]')?.focus({ preventScroll: true })
        }
      }}
      aria-label={`Kembali ke atas — sudah membaca ${percent}% halaman`}
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
      data-accent="magenta"
      className={cn(
        'group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:right-6 sm:bottom-6',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
      )}
    >
      {/* `cd ~`, slid out to the left on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 translate-x-2 border-2 border-line bg-surface px-2 py-1 text-[11px] font-bold whitespace-nowrap text-fg opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        <span className="text-accent-fg">$</span> cd ~
      </span>

      <span className="relative flex h-14 w-14 flex-col items-center justify-center overflow-hidden border-2 border-line bg-surface hard-shadow transition-transform duration-150 group-active:translate-x-[2px] group-active:translate-y-[2px]">
        {/* Reading progress, filling up from the bottom. */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 bg-accent/25 transition-[height] duration-150"
          style={{ height: `${percent}%` }}
        />
        <span
          aria-hidden
          className="absolute inset-x-0 border-t-2 border-dashed border-accent transition-[bottom] duration-150"
          style={{ bottom: `${percent}%` }}
        />

        <PixelArrow
          className={cn(
            'relative h-5 w-auto text-accent-fg',
            launching ? 'animate-[ksp-launch_0.6s_cubic-bezier(0.5,0,0.9,0.4)_forwards]' : 'group-hover:animate-[ksp-hop_0.7s_steps(4)_infinite]',
          )}
        />
        <span aria-hidden className="relative mt-1 text-[9px] leading-none font-bold text-muted tabular-nums">
          {percent}%
        </span>
      </span>
    </button>
  )
}
