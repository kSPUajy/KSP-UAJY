'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { useSignedIn } from '@/lib/hooks/useSignedIn'
import { supabaseBrowser } from '@/lib/supabase/browser'

/** How many signed-in people have the site open right now; null until known. */
let online: number | null = null
const listeners = new Set<() => void>()

function setOnline(value: number | null): void {
  online = value
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The live count, for anything that wants to show it. */
export function useOnlineCount(): number | null {
  return useSyncExternalStore(subscribe, () => online, () => null)
}

/**
 * Checks a signed-in visitor in on a Supabase Realtime presence channel for
 * as long as any page of the site is open. Keyed by user id, so several tabs
 * count once; closing the last one checks them out. Visitors who are not
 * signed in never join. Mounted once, in the root layout.
 */
export function OnlinePresence() {
  const signedIn = useSignedIn()

  useEffect(() => {
    if (!signedIn) return
    const supabase = supabaseBrowser()
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    void (async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user || cancelled) return
      channel = supabase.channel('ksp-online', { config: { presence: { key: user.id } } })
      channel
        .on('presence', { event: 'sync' }, () => {
          if (channel) setOnline(Object.keys(channel.presenceState()).length)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') void channel?.track({ sejak: new Date().toISOString() })
        })
    })()

    return () => {
      cancelled = true
      if (channel) void supabase.removeChannel(channel)
      setOnline(null)
    }
  }, [signedIn])

  return null
}

/** `5` with a live dot, or a dash while the count is still arriving. */
export function OnlineCount() {
  const count = useOnlineCount()
  return (
    <span className="inline-flex items-center gap-1.5" aria-live="polite">
      <span aria-hidden className="rec-blink inline-block h-1.5 w-1.5 bg-[#3ddc5b]" />
      {count === null ? '…' : count}
      <span className="sr-only"> orang sedang online</span>
    </span>
  )
}
