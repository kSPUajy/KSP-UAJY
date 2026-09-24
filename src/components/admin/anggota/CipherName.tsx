'use client'

import { useEffect, useState } from 'react'

import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const NOISE = '█▓▒░#@$%&*<>/\\|{}[]01ΣΞΨλ'
const DIGITS = '0123456789'

const scramble = (shape: string, pool: string): string =>
  [...shape].map((char) => (char === ' ' ? ' ' : (pool[Math.floor(Math.random() * pool.length)] ?? '#'))).join('')

type CipherNameProps = {
  /**
   * Only the shape of the hidden text — `xxxxx xxxxxxxxxxx` — never the text
   * itself, so it is not in the page or its payload at all.
   */
  shape: string
  /**
   * What hovering decodes it into, for a value meant as a clue. Leave out and
   * it never decodes.
   */
  reveal?: string
  /** `digits` churns through numbers only (an NPM); `noise` through symbols. */
  alphabet?: 'noise' | 'digits'
  /** `glitch`: sharp with RGB tearing. `blur`: slightly blurred, no tearing. */
  look?: 'glitch' | 'blur'
  /** What screen readers hear instead. */
  label?: string
}

/**
 * Text that churns through random characters in the shape of the real thing.
 * Without `reveal` there is nothing to decode — the real value never reaches
 * the browser. With it, hovering decodes left to right into that clue.
 */
export function CipherName({ shape, reveal, alphabet = 'noise', look = 'glitch', label = 'disembunyikan' }: CipherNameProps) {
  const pool = alphabet === 'digits' ? DIGITS : NOISE
  const reduced = useReducedMotion()
  const [hover, setHover] = useState(false)
  const [shown, setShown] = useState(() => shape.replace(/\S/g, '▒'))
  const decoding = hover && reveal !== undefined

  useEffect(() => {
    if (decoding && reveal !== undefined) {
      let revealed = 0
      const timer = window.setInterval(
        () => {
          revealed += 1
          setShown(reveal.slice(0, revealed) + scramble(reveal.slice(revealed), pool))
          if (revealed >= reveal.length) window.clearInterval(timer)
        },
        reduced ? 0 : 70,
      )
      return () => window.clearInterval(timer)
    }
    if (reduced) {
      const timer = window.setTimeout(() => setShown(shape.replace(/\S/g, '▒')), 0)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setInterval(() => setShown(scramble(shape, pool)), 110)
    return () => window.clearInterval(timer)
  }, [decoding, reveal, reduced, shape, pool])

  // A fixed box the width of the shape: the noise glyphs (█, Σ, …) come from
  // fallback fonts with their own widths, and without it everything after the
  // cipher — like the "I'am Here" tag — would jitter along with it.
  return (
    <span
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="inline-block overflow-x-clip align-bottom whitespace-pre"
      style={{ width: `${shape.length + (look === 'glitch' ? shape.length * 0.04 : 0)}ch` }}
    >
      {look === 'glitch' ? (
        <span aria-hidden className="glitch glitch-sharp tracking-[0.04em]" data-text={shown}>
          {shown}
        </span>
      ) : (
        <span aria-hidden className={`inline-block transition-[filter] duration-300 ${decoding ? 'text-accent-fg' : 'blur-[1px]'}`}>
          {shown}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </span>
  )
}
