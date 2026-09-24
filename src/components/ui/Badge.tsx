import type { AccentName } from '@/lib/accent'
import { DIFFICULTY_ACCENT } from '@/lib/accent'
import type { Difficulty } from '@/lib/types'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'solid' | 'outline' | 'ghost'
export type BadgeSize = 'sm' | 'md'

type BadgeProps = {
  variant?: BadgeVariant
  size?: BadgeSize
  /** Overrides the accent inherited from the surrounding section. */
  accent?: AccentName
  className?: string
  children: React.ReactNode
}

const VARIANTS: Record<BadgeVariant, string> = {
  solid: 'border-line bg-accent text-accent-ink',
  outline: 'border-accent-fg bg-transparent text-accent-fg',
  ghost: 'border-line-soft bg-transparent text-muted',
}

const SIZES: Record<BadgeSize, string> = {
  sm: 'h-5 px-1.5 text-[9px]',
  md: 'h-6 px-2 text-[10px]',
}

/** 2px is the one radius this system permits, and only here. */
export function Badge({ variant = 'ghost', size = 'md', accent, className, children }: BadgeProps) {
  return (
    <span
      data-accent={accent}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-chip border-2 font-display tracking-[0.1em] whitespace-nowrap uppercase',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * A data value rather than a label: a topic, a skill, a tag. Set in JetBrains
 * Mono and left lowercase, because the type spec keeps structured data out of
 * the bitmap face — `manajemen memori` has to stay readable at 11px, which
 * Silkscreen in capitals does not.
 */
export function Tag({
  prefix = '#',
  className,
  children,
}: {
  /** Printed dim before the value. Pass an empty string for none. */
  prefix?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 max-w-full items-center border-2 border-line-soft px-2 text-[11px] leading-none whitespace-nowrap text-muted',
        className,
      )}
    >
      {prefix ? (
        <span aria-hidden className="mr-0.5 shrink-0 text-dim">
          {prefix}
        </span>
      ) : null}
      {/* Its own box, so a value wider than a narrow card ellipsises instead
          of pushing the card wider. */}
      <span className="min-w-0 truncate">{children}</span>
    </span>
  )
}

/**
 * Difficulty always carries its own accent, never the section's — a SEGFAULT
 * challenge has to read the same wherever it appears.
 */
export function DifficultyBadge({
  difficulty,
  size = 'md',
  className,
}: {
  difficulty: Difficulty
  size?: BadgeSize
  className?: string
}) {
  return (
    <Badge variant="solid" size={size} accent={DIFFICULTY_ACCENT[difficulty]} className={className}>
      {difficulty}
    </Badge>
  )
}
