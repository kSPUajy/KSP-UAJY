'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * The query string as a store: filter state that lives in the URL, so a
 * filtered list can be shared and survives a reload.
 *
 * Deliberately not `useSearchParams`. On a statically generated page that
 * hook opts its subtree out of prerendering, which would strip the list out
 * of the HTML. This one reads nothing on the server — the page ships the
 * unfiltered list — and applies the URL's filters right after hydration.
 *
 * Writes go through `history.replaceState`, which Next.js integrates with
 * its router; `replaceState` fires no event of its own, hence the private one.
 */

const CHANGE_EVENT = 'ksp:querychange'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const getSnapshot = (): string => window.location.search
const getServerSnapshot = (): string => ''

export function useQueryParams(): {
  params: URLSearchParams
  setParams: (updates: Record<string, string | null>) => void
} {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setParams = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    const query = next.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return { params: new URLSearchParams(search), setParams }
}
