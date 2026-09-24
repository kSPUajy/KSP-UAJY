'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * Traps Tab focus inside a container while `active`, closes on Escape, locks
 * body scroll, and returns focus to whatever was focused before it opened.
 *
 * The container must be focusable itself (`tabIndex={-1}`) so there is
 * somewhere to land when it holds no interactive children yet.
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onEscape?: () => void,
): React.RefObject<T | null> {
  const containerRef = useRef<T | null>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  // Kept in a ref so an inline arrow from the caller does not re-run the trap.
  const escapeRef = useRef(onEscape)
  useEffect(() => {
    escapeRef.current = onEscape
  })

  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) return

    // Only something outside the container can be the thing that opened it.
    // If focus has already moved in, the opener is unknown: restore nothing
    // rather than "restore" to an element that is about to disappear.
    const opener = document.activeElement
    restoreRef.current = opener instanceof HTMLElement && !container.contains(opener) ? opener : null

    const visibleFocusables = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.getClientRects().length > 0,
      )

    const initial = visibleFocusables()[0] ?? container
    initial.focus({ preventScroll: true })

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        escapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const items = visibleFocusables()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) {
        event.preventDefault()
        container.focus({ preventScroll: true })
        return
      }

      const activeEl = document.activeElement
      if (event.shiftKey && (activeEl === first || activeEl === container)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.body.style.overflow = previousOverflow
      restoreRef.current?.focus({ preventScroll: true })
    }
  }, [active])

  return containerRef
}
