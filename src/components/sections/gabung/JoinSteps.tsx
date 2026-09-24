import { Stagger, StaggerItem } from '@/components/motion/Reveal'
import type { JoinStep } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type JoinStepsProps = {
  steps: readonly JoinStep[]
}

/**
 * Registration as a pipeline: one numbered stage per step, read left to
 * right from `lg` up and top to bottom below it. Each stage prints when it
 * runs as a comment, because "when" is relative to the stage before — the
 * dates themselves belong in the announcement, not here.
 */
export function JoinSteps({ steps }: JoinStepsProps) {
  return (
    <Stagger as="ol" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
      {steps.map((step, index) => (
        <StaggerItem
          as="li"
          key={step.id}
          className="relative flex flex-col border-2 border-line bg-surface p-5 lg:-ml-[2px] lg:first:ml-0"
        >
          <p className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-none text-accent-fg">
              {pad2(index + 1)}
            </span>
            <span aria-hidden className="text-[11px] text-dim">
              {index < steps.length - 1 ? '-->' : 'selesai'}
            </span>
          </p>
          <h3 className="mt-5 text-sm leading-6 font-bold text-fg">{step.judul}</h3>
          <p className="mt-2 text-[12px] leading-6 text-muted">{step.deskripsi}</p>
          <p className="mt-auto pt-5 text-[11px] leading-5 text-dim">
            <span aria-hidden>{'// '}</span>
            <span className="sr-only">Kapan: </span>
            {step.kapan}
          </p>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
