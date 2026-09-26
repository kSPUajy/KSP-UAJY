'use client'

import { useEffect, useState } from 'react'

import { scrollToTop } from '@/components/motion/SmoothScroll'
import { cn } from '@/lib/utils'

/** How far down, in screen heights, before the button offers itself. */
const AFTER_SCREENS = 1

/**
 * `cd ~` for long pages: a small key in the bottom-right corner that appears
 * once the page has been scrolled well past the first screen, and takes the
 * reader back to the top at the same eased pace as the wheel. From the
 * keyboard, focus goes to the skip link, so the next Tab starts at the top.
 */
export function BackToTop() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let frame = 0
    const check = (): void => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setShown(window.scrollY > window.innerHeight * AFTER_SCREENS))
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', check)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={(event) => {
        scrollToTop()
        // Keyboard activation only (a click has a non-zero `detail`): the
        // skip link shows itself on focus, which a mouse user never asked for.
        if (event.detail === 0) {
          document.querySelector<HTMLElement>('a[href="#konten-utama"]')?.focus({ preventScroll: true })
        }
      }}
      aria-label="Kembali ke atas"
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
      className={cn(
        'fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-11 items-center gap-1.5 border-2 border-line bg-surface px-3 text-[11px] font-bold tracking-[0.08em] text-fg hard-shadow transition-[opacity,transform] duration-200 press-pop hover:bg-accent hover:text-accent-ink sm:right-6 sm:bottom-6',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <span aria-hidden className="text-sm leading-none">
        ↑
      </span>
      cd ~
    </button>
  )
}
