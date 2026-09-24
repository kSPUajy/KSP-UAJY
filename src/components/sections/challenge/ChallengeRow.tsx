import Link from 'next/link'

import { DifficultyBadge, Tag } from '@/components/ui/Badge'
import type { ChallengeListItem } from '@/lib/challenge-list'
import { formatTanggalPendek } from '@/lib/format'
import { pad2 } from '@/lib/utils'

/**
 * One week in the archive: number, difficulty, title, topics, and how it
 * ended. The title is the only link; its hit area stretches over the row.
 */
export function ChallengeRow({ item, as: Heading = 'h3' }: { item: ChallengeListItem; as?: 'h2' | 'h3' }) {
  return (
    <article className="group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-4 px-4 py-5 transition-colors hover:bg-surface-2 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:px-6 lg:grid-cols-[4.5rem_minmax(0,1fr)_18rem]">
      <p className="font-display text-xl leading-none text-accent-fg sm:text-2xl">
        <span className="sr-only">Minggu </span>
        {pad2(item.minggu)}
      </p>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <DifficultyBadge difficulty={item.difficulty} size="sm" />
          <span className="text-[11px] leading-5 text-dim">rilis {formatTanggalPendek(item.tanggalRilis)}</span>
        </div>

        <Heading className="mt-2 text-base leading-6 font-bold text-fg sm:text-lg">
          <Link
            href={`/challenge/${item.slug}`}
            className="decoration-accent-fg decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {item.judul}
          </Link>
        </Heading>

        <ul aria-label="Topik" className="mt-3 flex flex-wrap gap-1.5">
          {item.topik.map((topik) => (
            <li key={topik}>
              <Tag>{topik}</Tag>
            </li>
          ))}
        </ul>
      </div>

      <dl className="col-start-2 grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-3 gap-y-1 text-[11px] leading-5 lg:col-start-3">
        <dt className="text-dim">status</dt>
        <dd className={item.closed ? 'text-muted' : 'text-accent-fg'}>
          {item.closed ? 'ditutup' : `terbuka · batas ${formatTanggalPendek(item.deadline)}`}
        </dd>
        <dt className="text-dim">peserta</dt>
        <dd className="text-muted tabular-nums">{item.totalPeserta}</dd>
        {item.closed ? (
          <>
            <dt className="text-dim">juara</dt>
            <dd className="text-fg">
              {item.winner ? (
                <>
                  {item.winner.nama}
                  {item.winner.runtimeMs !== undefined ? (
                    <>
                      {' '}
                      <span className="whitespace-nowrap text-dim">· {item.winner.runtimeMs} ms</span>
                    </>
                  ) : null}
                </>
              ) : (
                <span className="text-muted">penilaian berlangsung</span>
              )}
            </dd>
          </>
        ) : null}
      </dl>
    </article>
  )
}
