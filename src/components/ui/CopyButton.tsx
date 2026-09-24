'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/** Two overlapping sheets, drawn on the same grid as every other glyph here. */
function CopyGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" shapeRendering="crispEdges" aria-hidden focusable="false">
      <path d="M2 2h8v2H4v6H2z" fill="currentColor" />
      <rect x="6" y="6" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" shapeRendering="crispEdges" aria-hidden focusable="false">
      <path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

type CopyButtonProps = {
  text: string
  /** Spoken name of the button, e.g. "Salin masukan contoh 1". */
  label?: string
  /** Announced once the copy lands. */
  doneMessage?: string
  className?: string
}

/**
 * Copies the original source string, never the rendered DOM — so line numbers
 * and the non-breaking spaces that hold blank lines open never come along.
 */
export function CopyButton({
  text,
  label = 'Salin kode',
  doneMessage = 'Kode tersalin ke papan klip',
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard blocked (insecure origin, denied permission). Say nothing
      // rather than claim a copy that did not happen.
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className={cn(
        'inline-flex h-5 items-center gap-1.5 border-2 border-line-soft px-1.5 text-[10px] tracking-[0.08em] text-muted uppercase transition-colors hover:border-line hover:text-accent-fg',
        className,
      )}
    >
      {copied ? <CheckGlyph /> : <CopyGlyph />}
      <span aria-hidden>{copied ? 'tersalin' : 'salin'}</span>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? doneMessage : ''}
      </span>
    </button>
  )
}
