import { CountUp } from '@/components/ui/Stat'
import type { SiteStats } from '@/lib/types'
import { cn } from '@/lib/utils'

type CompileStripProps = {
  stats: SiteStats
  /** Seconds before the numbers start counting — the strip's own entrance beat. */
  countDelay?: number
}

/**
 * The bottom of the hero terminal: `make stats`, printed like build output.
 *
 * Marked up as a real description list — each figure is a `<dd>` under the
 * `<dt>` that names it — and only visually flipped so the number reads first.
 */
export function CompileStrip({ stats, countDelay = 0 }: CompileStripProps) {
  const rows = [
    { key: 'anggota', label: 'anggota aktif', value: stats.anggota },
    { key: 'tentor', label: 'tentor aktif', value: stats.tentorAktif },
    { key: 'challenge', label: 'challenge terbit', value: stats.challengeTerbit },
    { key: 'submission', label: 'total submission', value: stats.totalSubmission },
  ] as const

  return (
    <div className="border-t-2 border-line bg-surface">
      <div className="flex items-center justify-between gap-4 border-b-2 border-line-soft px-4 py-2 text-[11px] leading-5 sm:px-8 lg:px-12">
        <p className="text-muted">
          <span aria-hidden className="text-accent-fg">
            $
          </span>{' '}
          make stats
        </p>
        <p className="text-dim">
          <span className="text-accent-fg">0</span> error · <span className="text-accent-fg">0</span>{' '}
          warning
        </p>
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {rows.map((row, index) => (
          <div
            key={row.key}
            className={cn(
              'flex flex-col-reverse justify-end gap-2 px-4 py-4 sm:px-8 sm:py-5 lg:px-12 short:lg:py-3',
              // Vertical rules between columns, horizontal between rows — only
              // where a neighbour actually exists at each breakpoint.
              index % 2 === 0 && 'border-r-2 border-line-soft',
              index < 2 && 'border-b-2 border-line-soft lg:border-b-0',
              index === 1 && 'lg:border-r-2',
            )}
          >
            <dt className="text-[10px] leading-4 tracking-[0.1em] text-muted uppercase">
              {row.label}
            </dt>
            <dd className="font-display text-[clamp(1.375rem,3.6vw,2rem)] leading-none text-accent-fg">
              <CountUp value={row.value} delay={countDelay} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
