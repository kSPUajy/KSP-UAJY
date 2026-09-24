import Link from 'next/link'

import { DitherImage } from '@/components/ui/DitherImage'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import type { OrgBranch } from '@/lib/org'
import { PORTRAIT } from '@/lib/types'

type OrgBranchColumnProps = {
  branch: OrgBranch
  /** Who the branch hangs off, named for when no line can be drawn (stacked). */
  parentName: string
}

/**
 * The tentors, as one window listing everyone — twenty cards the size of a
 * pengurus card would outgrow the chart. Each line is a link to that tentor's
 * profile; the connector from the Koordinator Tentor lands on this window.
 */
export function OrgBranchColumn({ branch, parentName }: OrgBranchColumnProps) {
  return (
    <div
      data-org-branch
      data-parent-id={branch.parentId}
      role="group"
      aria-label={`${branch.label}, di bawah ${parentName}`}
      className="relative max-w-xl pl-6 lg:max-w-none"
    >
      <p aria-hidden className="mb-4 font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">
        {`// ${branch.label}`}
        <span className="text-dim normal-case lg:hidden">{` <- ${parentName}`}</span>
      </p>

      <TerminalWindow title={`~/struktur/${branch.label}/`} bodyClassName="p-0">
        <ul>
          {branch.items.map((item) => (
            <li key={item.id} className="border-b-2 border-line-soft last:border-b-0">
              <Link
                href={`/tentor/${item.slug}`}
                className="group/row flex items-center gap-3 px-3 py-2 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"
              >
                <DitherImage
                  src={item.foto}
                  alt=""
                  width={PORTRAIT.width}
                  height={PORTRAIT.height}
                  sizes="28px"
                  reveal="row"
                  className="aspect-[4/5] w-7 shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-fg transition-[color,translate] duration-200 group-hover/row:translate-x-1 group-hover/row:text-accent-fg group-focus-visible/row:translate-x-1 group-focus-visible/row:text-accent-fg motion-reduce:translate-x-0">
                  {item.nama}
                </span>
                {item.modul.length > 0 ? (
                  <span className="shrink-0 text-[11px] text-dim tabular-nums transition-colors group-hover/row:text-accent-fg group-focus-visible/row:text-accent-fg">
                    {item.modul.join(' ')}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <p className="border-t-2 border-line-soft px-3 py-2 text-[11px] text-dim">{branch.items.length} tentor</p>
      </TerminalWindow>
    </div>
  )
}
