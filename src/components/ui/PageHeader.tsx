import { Prompt } from '@/components/ui/Prompt'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import type { AccentName } from '@/lib/accent'
import { cn } from '@/lib/utils'

export type PageFact = {
  label: string
  value: string | number
}

type PageHeaderProps = {
  accent: AccentName
  /** What the reader "ran" to get here, e.g. `cd ~/struktur`. */
  command: string
  eyebrow: string
  title: string
  description?: string
  /** A few hard numbers, printed as `key=value` flags under the description. */
  facts?: readonly PageFact[]
  /** Rendered above the prompt — a `cd ..` back link on detail pages. */
  before?: React.ReactNode
  className?: string
}

/**
 * The top band of every inner page: the command that "opened" it, the
 * section comment, the page's single `<h1>`, and a line of facts.
 *
 * A `<header>` inside `<main>` carries no banner role, so this never
 * competes with the site navigation for that landmark.
 */
export function PageHeader({
  accent,
  command,
  eyebrow,
  title,
  description,
  facts,
  before,
  className,
}: PageHeaderProps) {
  return (
    <header data-accent={accent} className={cn('relative border-b-2 border-line bg-canvas dot-grid', className)}>
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        {before ? <div className="mb-8">{before}</div> : null}

        <Prompt>{command}</Prompt>

        <p className="mt-8 font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
          {`// ${eyebrow}`}
        </p>

        <h1 className="mt-4 max-w-4xl font-display text-[clamp(1.5rem,4.6vw,2.75rem)] leading-[1.2] tracking-[0.04em] text-fg uppercase">
          {title}
        </h1>

        {description ? (
          <p className="mt-6 max-w-prose text-sm leading-7 text-muted sm:text-[15px]">{description}</p>
        ) : null}

        {facts && facts.length > 0 ? (
          // Printed as `key=value`; the `=` is hidden and a screen reader
          // hears "pengurus: 14".
          <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs leading-6">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline">
                <dt className="text-dim">{fact.label}</dt>
                <dd className="text-accent-fg">
                  <span aria-hidden className="text-dim">
                    =
                  </span>
                  <span className="sr-only">: </span>
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </header>
  )
}

/** The same band while a route loads: prompt, eyebrow, title, two lines. */
export function PageHeaderSkeleton() {
  return (
    <div aria-hidden className="relative border-b-2 border-line bg-canvas dot-grid">
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-8 h-3 w-28" />
        <Skeleton className="mt-5 h-10 w-full max-w-2xl" />
        <SkeletonText lines={2} className="mt-6 max-w-prose" />
      </div>
    </div>
  )
}
