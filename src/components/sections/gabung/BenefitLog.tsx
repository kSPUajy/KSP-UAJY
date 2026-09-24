import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { Benefit } from '@/lib/types'

/**
 * What membership installs, printed as a build log. Shared by the home page's
 * closing band and `/gabung`, which read the same `JoinInfo` record.
 */
export function BenefitLog({ benefits, className }: { benefits: readonly Benefit[]; className?: string }) {
  return (
    <TerminalWindow title="~/gabung/manfaat.log" tone="code" className={className}>
      <p className="text-[12px] leading-6 text-muted">
        <span aria-hidden className="text-accent-fg">
          ${' '}
        </span>
        make install
      </p>

      <ul aria-label="Yang kamu dapat" className="mt-4 space-y-3">
        {benefits.map((benefit) => (
          <li key={benefit.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 text-[12px] leading-5">
            <span aria-hidden className="text-accent-fg">
              [ ok ]
            </span>
            <span>
              <span className="font-bold text-fg">{benefit.judul}</span>
              <span className="block text-muted">{benefit.deskripsi}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t-2 border-line-soft pt-4 text-[11px] leading-5 text-dim">
        instalasi selesai — <span className="text-accent-fg">{benefits.length}</span> paket
        terpasang, <span className="text-accent-fg">0</span> error.
      </p>
    </TerminalWindow>
  )
}
