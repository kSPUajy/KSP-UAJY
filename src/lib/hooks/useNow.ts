'use client'

import { useSyncExternalStore } from 'react'

/**
 * One shared wall clock, ticking once per second.
 *
 * Every countdown on a page subscribes to the same timer, and each tick is
 * scheduled against the next whole-second boundary rather than a fixed
 * interval — so the digits never drift, and two countdowns on one page always
 * flip in the same frame.
 */

let currentSecond = 0
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

const readSecond = (): number => Math.floor(Date.now() / 1000)

function scheduleTick(): void {
  // A few ms past the boundary, so the floor above never reads the old second.
  timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 4)
}

function tick(): void {
  currentSecond = readSecond()
  for (const listener of listeners) listener()
  scheduleTick()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    currentSecond = readSecond()
    scheduleTick()
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }
}

function getSnapshot(): number {
  // While nothing is subscribed the cached second goes stale; refresh it so a
  // remounting countdown never paints a time from its previous life.
  if (timer === undefined) currentSecond = readSecond()
  return currentSecond
}

/** No clock exists on the server, and the build-time clock is always wrong. */
const getServerSnapshot = (): null => null

/**
 * Current Unix time in whole seconds, or `null` during SSR and hydration.
 * Callers render a designed placeholder for `null` — never a guessed time.
 */
export function useNowSeconds(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
