import { cn } from '@/lib/utils'

/**
 * Loading placeholder. Hard-edged and opacity-pulsed rather than a blurred
 * shimmer — a gradient sweep would break the form language, and blur is not
 * available in this system at all.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('skeleton block border-2 border-line-soft bg-surface-2', className)}
    />
  )
}

/** A few stacked bars at descending widths, shaped like a paragraph. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-5/6', 'w-3/4']

  return (
    <span aria-hidden className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn('h-3', widths[index % widths.length])} />
      ))}
    </span>
  )
}
