'use client'

import { useState } from 'react'
import { motion } from 'motion/react'

import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

type TypewriterProps = {
  text: string
  /** Seconds per character. */
  charDelay?: number
  /** Seconds before the first character. */
  startDelay?: number
  cursor?: boolean
  /**
   * Background of the surface the text sits on. The mask that hides the
   * untyped characters is painted in it, so it has to match exactly.
   */
  maskClassName?: string
  className?: string
  /** Fires once the last character has landed. */
  onComplete?: () => void
}

/**
 * `steps()` that lands exactly on 1. Motion's own version clamps progress to
 * 0.999 on the `end` side, which would leave the final character unrevealed.
 */
const stepEase =
  (count: number) =>
  (progress: number): number =>
    Math.floor(progress * count) / count

/**
 * Types a string out one character per step.
 *
 * The text is laid out in full from the first frame. A mask painted in the
 * background colour slides off it in whole-character steps, carrying the block
 * cursor on its leading edge — so the cursor always sits on the cell the next
 * character will fill, nothing reflows while it types, and the only property
 * that animates is `transform`. Stepping by exactly one character relies on a
 * monospace face, which is the only face this component is ever set in.
 *
 * Like a real terminal, the cursor holds solid while characters are arriving
 * and only blinks while it waits.
 *
 * The full string is exposed to assistive tech once; the painted copy and the
 * mask are hidden from it.
 */
export function Typewriter({
  text,
  charDelay = 0.032,
  startDelay = 0,
  cursor = false,
  maskClassName = 'bg-canvas',
  className,
  onComplete,
}: TypewriterProps) {
  const reduced = useReducedMotion()
  const [typing, setTyping] = useState(false)
  const length = Math.max(Array.from(text).length, 1)

  return (
    <span
      data-typewriter
      className={cn(
        'relative inline-block max-w-full overflow-hidden align-bottom whitespace-pre',
        cursor && 'pr-[1ch]',
        className,
      )}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>{text}</span>

      {reduced ? (
        cursor ? (
          <span aria-hidden className="absolute inset-y-0 right-0 w-[1ch] bg-accent-fg" />
        ) : null
      ) : (
        <motion.span
          aria-hidden
          data-typewriter-mask
          // Width is the text alone, so `x: 100%` is exactly one line of type
          // and the cursor comes to rest in the padding cell after it.
          className={cn(
            'absolute inset-y-0 left-0 motion-reduce:hidden',
            cursor ? 'w-[calc(100%-1ch)]' : 'w-full',
            maskClassName,
          )}
          initial={{ x: '0%' }}
          animate={{ x: '100%' }}
          transition={{ duration: length * charDelay, delay: startDelay, ease: stepEase(length) }}
          onAnimationStart={() => setTyping(true)}
          onAnimationComplete={() => {
            setTyping(false)
            onComplete?.()
          }}
        >
          {cursor ? (
            <span
              className={cn(
                'absolute inset-y-0 left-0 w-[1ch] bg-accent-fg',
                !typing && 'cursor-blink',
              )}
            />
          ) : null}
        </motion.span>
      )}
    </span>
  )
}
