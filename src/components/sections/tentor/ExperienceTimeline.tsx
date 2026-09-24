import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import type { Pengalaman } from '@/lib/types'
import { cn } from '@/lib/utils'

type ExperienceTimelineProps = {
  items: readonly Pengalaman[]
  className?: string
}

/**
 * Experience as a rail with square nodes, oldest first so it reads as a path
 * rather than a résumé. The rail is the list's own border; each node is a
 * hard square sitting on it — no radius, no glow.
 */
export function ExperienceTimeline({ items, className }: ExperienceTimelineProps) {
  return (
    <Stagger as="ol" className={cn('relative border-l-2 border-line-soft', className)}>
      {items.map((item) => (
        <StaggerItem as="li" key={`${item.tahun}-${item.judul}`} className="relative pb-8 pl-6 last:pb-0">
          <span aria-hidden className="absolute top-1 -left-[9px] block h-4 w-4 border-2 border-line bg-accent" />
          <p className="font-display text-[10px] leading-5 tracking-[0.16em] text-accent-fg uppercase">
            <time>{item.tahun}</time>
          </p>
          <h3 className="mt-1 text-sm leading-6 font-bold text-fg">{item.judul}</h3>
          <p className="mt-1 max-w-prose text-sm leading-6 text-muted">{item.deskripsi}</p>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
