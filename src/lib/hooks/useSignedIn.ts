'use client'

import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'

/**
 * Whether this browser holds a Supabase session cookie — a hint for the
 * nav, not a security check. It never makes a request, so the public pages
 * stay static; the account pages verify the session properly on the server.
 *
 * The cookie is `sb-<project ref>-auth-token`, split into `.0`, `.1`… when
 * large. Signing in or out ends in a navigation, so re-reading on every
 * pathname change is enough to keep the label honest.
 */

const PROJECT_REF = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname.split('.')[0] ?? ''
  } catch {
    return ''
  }
})()

const COOKIE_PREFIX = `sb-${PROJECT_REF}-auth-token`

const subscribe = (): (() => void) => () => {}

function readCookie(): boolean {
  if (!PROJECT_REF) return false
  return document.cookie.split(';').some((part) => part.trim().startsWith(COOKIE_PREFIX))
}

export function useSignedIn(): boolean {
  // Subscribing to the pathname re-renders on navigation; the snapshot is
  // then read fresh.
  usePathname()
  return useSyncExternalStore(subscribe, readCookie, () => false)
}
