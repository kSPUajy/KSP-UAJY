import { cn } from '@/lib/utils'

type PromptProps = {
  /** Shell sigil. `$` for a user command, `>` for continuation, `#` for root. */
  symbol?: string
  /** Renders a blinking block cursor after the text. */
  cursor?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * A shell command line. Used as a label above panels, in empty states, and as
 * the hero's opening beat.
 */
export function Prompt({ symbol = '$', cursor = false, className, children }: PromptProps) {
  return (
    <p className={cn('text-xs text-muted', className)}>
      <span className="text-accent-fg" aria-hidden>
        {symbol}
      </span>{' '}
      {children}
      {cursor ? (
        <span
          aria-hidden
          className="cursor-blink ml-1 inline-block h-[0.95em] w-[0.55em] translate-y-[0.12em] bg-accent-fg"
        />
      ) : null}
    </p>
  )
}
