'use client'

import { useSyncExternalStore } from 'react'

/**
 * The URL fragment as a store, so a page can keep a selection in the address
 * bar: it survives a reload, it can be linked to, and on a phone the back
 * button closes whatever the fragment opened — which is what people press.
 *
 * Fragment navigations fire `hashchange`; `replaceState` does not, so
 * `clearLocationHash` announces itself on a private event as well.
 */

const CLEAR_EVENT = 'ksp:hashclear'

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  window.addEventListener(CLEAR_EVENT, onChange)
  return () => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener(CLEAR_EVENT, onChange)
  }
}

function getSnapshot(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1))
  } catch {
    return ''
  }
}

/** Empty through SSR and hydration; the real fragment arrives right after. */
const getServerSnapshot = (): string => ''

export function useLocationHash(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** New history entry, so Back undoes it. */
export function pushLocationHash(value: string): void {
  window.location.hash = encodeURIComponent(value)
}

/** Same history entry — for moving between items while one is already open. */
export function replaceLocationHash(value: string): void {
  window.location.replace(`#${encodeURIComponent(value)}`)
}

/**
 * Drops the fragment without adding or leaving a history entry. The router's
 * own state object is carried over, so Next.js keeps recognising the entry.
 */
export function clearLocationHash(): void {
  const { pathname, search } = window.location
  window.history.replaceState(window.history.state, '', `${pathname}${search}`)
  window.dispatchEvent(new Event(CLEAR_EVENT))
}
