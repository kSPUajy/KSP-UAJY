import { Prompt } from '@/components/ui/Prompt'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title: string
  description: string
  /** Shell command the reader just "ran", e.g. `ls ~/challenge`. */
  command?: string
  /** What the command printed back — usually a count. */
  output?: string
  action?: React.ReactNode
  accent?: AccentName
  className?: string
}

/**
 * Every list in this site gets a designed zero state rather than blank space.
 * It reads as a command that legitimately returned nothing.
 */
export function EmptyState({
  title,
  description,
  command = 'ls',
  output = '0 hasil',
  action,
  accent,
  className,
}: EmptyStateProps) {
  return (
    <TerminalWindow
      title="~/void"
      accent={accent}
      tone="code"
      className={cn('mx-auto max-w-lg', className)}
    >
      <Prompt>{command}</Prompt>
      <p className="mt-2 text-xs text-dim">{output}</p>

      <p className="mt-6 font-display text-[11px] tracking-[0.14em] text-accent-fg uppercase">
        {title}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>

      {action ? <div className="mt-6 flex flex-wrap gap-3">{action}</div> : null}
    </TerminalWindow>
  )
}
