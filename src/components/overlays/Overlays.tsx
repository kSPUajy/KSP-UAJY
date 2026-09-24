import { cn } from '@/lib/utils'

/**
 * Decorative CRT furniture. Every one of these is inert: `aria-hidden` plus
 * `pointer-events-none`, so nothing here can intercept a click or reach a
 * screen reader. Opacity comes from the theme tokens, which is what keeps the
 * text underneath above 4.5:1 in both modes.
 */

type OverlayProps = { className?: string }

export function Scanlines({ className }: OverlayProps) {
  return <div aria-hidden className={cn('pointer-events-none absolute inset-0 scanlines', className)} />
}

export function Grain({ className }: OverlayProps) {
  return <div aria-hidden className={cn('pointer-events-none absolute inset-0 grain', className)} />
}

export function CrtVignette({ className }: OverlayProps) {
  return <div aria-hidden className={cn('pointer-events-none absolute inset-0 crt-vignette', className)} />
}

export function DotGrid({ className }: OverlayProps) {
  return <div aria-hidden className={cn('pointer-events-none absolute inset-0 dot-grid', className)} />
}

/**
 * Viewport-level scanline + grain pass. Sits above content but below modals,
 * and is the only overlay that is `fixed`.
 */
export function PageOverlays() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
      <div className="absolute inset-0 scanlines" />
      <div className="absolute inset-0 grain" />
    </div>
  )
}
