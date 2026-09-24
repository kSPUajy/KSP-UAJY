'use client'

import { useSyncExternalStore } from 'react'

const neverChanges = (): (() => void) => () => {}
const onClient = (): boolean => true
const onServer = (): boolean => false

/**
 * False while rendering on the server and during hydration, true afterwards.
 *
 * Built on `useSyncExternalStore` rather than `useState` + `useEffect` so it
 * resolves as part of hydration instead of scheduling an extra render pass.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(neverChanges, onClient, onServer)
}
