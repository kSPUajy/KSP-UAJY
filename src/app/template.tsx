'use client'

import { useState } from 'react'

import { useMounted } from '@/lib/hooks/useMounted'

/**
 * Page transition: short fade plus an 8px rise.
 *
 * `template.tsx` remounts on every navigation, so a plain CSS animation is
 * enough — and unlike a Framer wrapper it leaves no lingering transform, which
 * would otherwise turn this element into the containing block for every
 * `position: fixed` overlay on the page.
 *
 * The first document load is not a transition, so it does not fade. That is
 * not just taste: Chrome records Largest Contentful Paint when an element
 * becomes visible, and a page fading up from opacity 0 pushed the hero
 * heading's LCP back by the length of the fade. `useMounted` is false while
 * hydrating the server's HTML and true for every instance a client-side
 * navigation creates; capturing it once at mount tells the two apart.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const mounted = useMounted()
  const [isTransition] = useState(mounted)

  return <div className={isTransition ? 'page-in' : undefined}>{children}</div>
}
