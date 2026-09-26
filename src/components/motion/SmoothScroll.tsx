'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** The running instance, for code that scrolls on purpose (back to top). */
let active: Lenis | null = null

/** Scrolls to `top` at Lenis's pace when it is running, natively otherwise. */
export function scrollToTop(): void {
  if (active) active.scrollTo(0)
  else window.scrollTo({ top: 0 })
}

/**
 * Jumps an element to the top of the view, clear of the sticky nav — for a
 * new page of content, where a glide would only delay it. Goes through
 * Lenis when it is running: a native jump would be undone by Lenis easing
 * back to where it thinks the page is.
 */
export function scrollToElement(element: HTMLElement, offset = -96): void {
  if (active) active.scrollTo(element, { offset, immediate: true, force: true })
  else window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + offset })
}

/**
 * Eased wheel scrolling for the whole site. Touch keeps the native feel, and
 * `prefers-reduced-motion` skips Lenis entirely. In-page anchors are handed
 * to Lenis too, so they glide at the same pace as the wheel.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      // Drawers, the mobile menu and sticky side columns scroll on their own.
      allowNestedScroll: true,
    })
    lenisRef.current = lenis
    active = lenis

    return () => {
      lenis.destroy()
      lenisRef.current = null
      active = null
    }
  }, [])

  // A route change mid-glide would otherwise keep easing toward the old
  // page's target and fight the router's jump to the top.
  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return
    lenis.stop()
    lenis.start()
  }, [pathname])

  return null
}
