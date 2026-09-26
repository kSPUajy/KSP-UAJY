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
 * Every visitor listens to a Supabase Realtime presence channel, so the
 * count can show anywhere — the hero included. Only signed-in members are
 * *counted*: they check in (`track`) for as long as any page of the site is
 * open, keyed by user id so several tabs count once. Anyone else only
 * listens, and a listener never appears in the presence state. Mounted
 * once, in the root layout.
 */
export function OnlinePresence() {
  const signedIn = useSignedIn()

  useEffect(() => {
    const supabase = supabaseBrowser()
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    void (async () => {
      const user = signedIn ? (await supabase.auth.getUser()).data.user : null
      if (cancelled) return
      // A listener still needs some key; a random one never gets tracked.
      const key = user?.id ?? `tamu-${crypto.randomUUID()}`
      channel = supabase.channel('ksp-online', { config: { presence: { key } } })
      channel
        .on('presence', { event: 'sync' }, () => {
          if (channel) setOnline(Object.keys(channel.presenceState()).length)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && user) void channel?.track({ sejak: new Date().toISOString() })
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

/**
 * `5` with a live dot, or an ellipsis while the count is still arriving.
 * `suffix` reads after the number, e.g. "anggota sedang di situs".
 */
export function OnlineCount({ suffix }: { suffix?: string }) {
  const count = useOnlineCount()
  return (
    <span className="inline-flex items-center gap-1.5" aria-live="polite">
      <span aria-hidden className="rec-blink inline-block h-1.5 w-1.5 bg-[#3ddc5b]" />
      {count === null ? '…' : count}
      {suffix ? <span> {suffix}</span> : <span className="sr-only"> orang sedang online</span>}
    </span>
  )
}
