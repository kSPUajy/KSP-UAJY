import { cn, pad2 } from '@/lib/utils'

type LineGutterProps = {
  /** Rows to print. Each one occupies exactly one 24px baseline row. */
  lines?: number
  className?: string
}

/**
 * The line-number rail that runs down the left edge of long content blocks.
 *
 * Purely typographic furniture: inert, unselectable, and locked to the 24px
 * baseline so its numbers line up with the text beside it.
 */
export function LineGutter({ lines = 24, className }: LineGutterProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none flex select-none flex-col text-[10px] leading-6 text-dim tabular-nums',
        className,
      )}
    >
      {Array.from({ length: lines }, (_, index) => (
        <span key={index}>{pad2(index + 1)}</span>
      ))}
    </div>
  )
}

/**
 * Wraps content in a gutter + body pair. The gutter is hidden below `sm`,
 * where the 44px it costs matters more than the texture it adds.
 */
export function GutteredBlock({
  lines = 24,
  className,
  children,
}: LineGutterProps & { children: React.ReactNode }) {
  return (
    <div className={cn('flex gap-4', className)}>
      <LineGutter lines={lines} className="hidden shrink-0 border-r-2 border-line-soft pr-3 sm:flex" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
