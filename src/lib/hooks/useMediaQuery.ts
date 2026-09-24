'use client'

import { useCallback, useSyncExternalStore } from 'react'

const lists = new Map<string, MediaQueryList>()

function mediaQuery(query: string): MediaQueryList {
  let list = lists.get(query)
  if (!list) {
    list = window.matchMedia(query)
    lists.set(query, list)
  }
  return list
}

/**
 * `matchMedia` as a store. `false` through SSR and hydration, so only use it
 * for things that do not exist until someone interacts — a drawer choosing
 * which edge to slide in from, not the layout of the page itself.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = mediaQuery(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  const getSnapshot = useCallback(() => mediaQuery(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
