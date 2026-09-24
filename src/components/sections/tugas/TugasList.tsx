import { StateBadge, TugasPanel } from '@/components/sections/tugas/TugasPanel'
import { formatTanggalPendek } from '@/lib/format'
import type { TugasItem } from '@/lib/tugas/status'
import { cn, pad2 } from '@/lib/utils'

/**
 * Every week as a disclosure row: week, module, status and due date on the
 * line, the full panel underneath. This week's row starts open. Native
 * `<details>`, so it works with the keyboard and without script.
 */
export function TugasList({ items, openId }: { items: readonly TugasItem[]; openId?: string }) {
  return (
    <ol className="border-t-2 border-line">
      {items.map((item) => {
        const locked = item.state === 'terkunci'
        return (
          <li key={item.modul.id} id={`tugas-${pad2(item.modul.minggu)}`} className="scroll-mt-24 border-b-2 border-line">
            <details open={item.modul.id === openId} className="group">
              <summary className="grid cursor-pointer list-none grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-3 py-4 transition-colors hover:bg-surface-2 sm:grid-cols-[4rem_minmax(0,1fr)_auto_auto] [&::-webkit-details-marker]:hidden">
                <span className={cn('font-display text-[11px] tracking-[0.12em]', locked ? 'text-dim' : 'text-accent-fg')}>
                  M{pad2(item.modul.minggu)}
                </span>
                <span className={cn('min-w-0 truncate text-sm font-bold', locked ? 'text-muted' : 'text-fg')}>
                  <span aria-hidden className="mr-2 font-normal text-dim group-open:hidden">
                    +
                  </span>
                  <span aria-hidden className="mr-2 hidden font-normal text-accent-fg group-open:inline">
                    -
                  </span>
                  {item.modul.judul}
                </span>
                <span className="col-start-2 sm:col-start-auto">
                  <StateBadge state={item.state} />
                </span>
                <span className="col-start-2 text-[11px] text-dim tabular-nums sm:col-start-auto">
                  {item.submission?.nilai != null ? `nilai ${item.submission.nilai}` : `tenggat ${formatTanggalPendek(item.deadline)}`}
                </span>
              </summary>
              <div className="border-t-2 border-line-soft px-3 py-5 sm:pl-[5.25rem]">
                <TugasPanel item={item} />
              </div>
            </details>
          </li>
        )
      })}
    </ol>
  )
}
