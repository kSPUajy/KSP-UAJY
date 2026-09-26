'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

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

    return () => {
      lenis.destroy()
      lenisRef.current = null
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
