import { cn } from '@/lib/utils'

/** Numbered sections on the home page. Update when one is added or removed. */
export const HOME_SECTIONS = 8

type SectionMarkerProps = {
  /** 1-based position on the page. */
  index: number
  label: string
  total?: number
  className?: string
}

/**
 * Where a section sits on the page, as a reading-progress bar: its name,
 * one cell per section filled up to this one, and `5/8`. Replaces the
 * `// 05 — berita` comment eyebrow on the numbered home sections.
 */
export function SectionMarker({ index, label, total = HOME_SECTIONS, className }: SectionMarkerProps) {
  return (
    <p className={cn('flex items-center gap-3 font-display text-[10px] tracking-[0.18em] uppercase', className)}>
      <span className="text-accent-fg">{label}</span>
      <span aria-hidden className="flex gap-[3px]">
        {Array.from({ length: total }, (_, cell) => (
          <span
            key={cell}
            className={cn(
              'h-2 w-3 -skew-x-[20deg]',
              cell < index ? 'bg-accent' : 'border border-line-soft',
              cell === index - 1 && 'hard-shadow-line',
            )}
          />
        ))}
      </span>
      <span className="text-dim tabular-nums">
        <span aria-hidden>
          {index}/{total}
        </span>
        <span className="sr-only">
          bagian {index} dari {total}
        </span>
      </span>
    </p>
  )
}
