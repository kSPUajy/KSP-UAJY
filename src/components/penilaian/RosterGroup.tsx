import Link from 'next/link'

import { DownloadButton } from '@/components/sections/tugas/DownloadButton'
import { Badge } from '@/components/ui/Badge'
import { formatTanggalWaktu, toWib } from '@/lib/format'
import type { RosterRow } from '@/lib/tugas/grading'

/**
 * One slice of a module's roster — waiting, graded, or still missing — as
 * rows of member, file, time, and the way into grading. Shared by the
 * grading pages and the admin panel, so both read the same list.
 */
export function RosterGroup({
  id,
  title,
  rows,
  moduleId,
  empty,
  heading: Heading = 'h2',
  className = 'mt-10',
}: {
  id: string
  title: string
  rows: RosterRow[]
  moduleId: string
  empty: string
  /** `h3` where the list sits under a section that has its own heading. */
  heading?: 'h2' | 'h3'
  className?: string
}) {
  return (
    <section aria-labelledby={id} className={className}>
      <Heading id={id} className="text-[11px] tracking-[0.12em] text-dim uppercase">
        {`// ${title} (${rows.length})`}
      </Heading>
      {rows.length === 0 ? (
        <p className="mt-3 text-[12px] text-dim">{empty}</p>
      ) : (
        <ul className="mt-3 border-t-2 border-line">
          {rows.map((row) => (
            <li
              key={row.profileId}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b-2 border-line px-3 py-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto_auto_auto]"
            >
              <span className="text-[12px] text-muted tabular-nums">{row.npm}</span>
              <span className="col-start-1 row-start-2 min-w-0 sm:col-start-auto sm:row-start-auto">
                <span className="block truncate text-sm font-bold text-fg">{row.nama}</span>
                {row.submission ? <span className="block truncate text-[11px] text-dim">{row.submission.fileName}</span> : null}
              </span>
              {row.submission ? (
                <>
                  <span className="hidden text-[11px] text-dim sm:inline">{formatTanggalWaktu(toWib(row.submission.submittedAt))}</span>
                  <span className="flex items-center gap-2">
                    {row.submission.terlambat ? (
                      <Badge size="sm" variant="outline" accent="orange">
                        terlambat
                      </Badge>
                    ) : null}
                    {row.submission.nilai !== null ? (
                      <Badge size="sm" variant="solid">
                        {row.submission.nilai}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="flex items-center gap-3 text-[12px]">
                    <DownloadButton submissionId={row.submission.id} fileName={row.submission.fileName} />
                    <Link href={`/penilaian/${moduleId}/${row.submission.id}`} className="font-bold text-accent-fg hover:underline">
                      {row.submission.nilai === null ? 'nilai' : 'lihat'} <span aria-hidden>-&gt;</span>
                    </Link>
                  </span>
                </>
              ) : (
                <span className="text-[11px] text-dim sm:col-span-3">belum mengumpulkan</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
