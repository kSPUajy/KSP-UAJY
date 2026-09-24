import { cn, pad2 } from '@/lib/utils'

type SectionHeaderProps = {
  /** Section number, printed in the eyebrow: `// 03 — TENTOR`. */
  index?: number
  eyebrow: string
  title: string
  description?: string
  /** Lets the enclosing section point `aria-labelledby` at this heading. */
  headingId?: string
  as?: 'h2' | 'h3'
  align?: 'left' | 'center'
  /** Rendered opposite the title on wide screens — a "lihat semua" link, say. */
  actions?: React.ReactNode
  className?: string
}

/**
 * Eyebrows are written as C comments, which is the one place the language
 * motif earns its keep: it labels without decorating.
 *
 * Titles use Silkscreen at display-small sizes with wide tracking. Anything
 * longer than a heading stays in JetBrains Mono, so the bitmap face never has
 * to carry a paragraph.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  headingId,
  as: Heading = 'h2',
  align = 'left',
  actions,
  className,
}: SectionHeaderProps) {
  const label = index === undefined ? `// ${eyebrow}` : `// ${pad2(index)} — ${eyebrow}`

  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        // Same-property utilities resolve by stylesheet order, not class
        // order, so the centred layout replaces the row layout outright.
        align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className={cn('min-w-0', align === 'center' && 'flex flex-col items-center')}>
        <p className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
          {label}
        </p>

        <Heading
          id={headingId}
          className="mt-4 font-display text-[clamp(1.125rem,2.6vw,1.625rem)] leading-[1.35] tracking-[0.06em] text-fg uppercase"
        >
          {title}
        </Heading>

        {description ? (
          <p
            className={cn(
              'mt-4 max-w-prose text-sm leading-7 text-muted',
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  )
}
