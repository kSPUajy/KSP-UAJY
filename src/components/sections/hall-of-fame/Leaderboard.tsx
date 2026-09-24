import Link from 'next/link'

import { MeterBar } from '@/components/ui/MeterBar'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { pad2 } from '@/lib/utils'

export type Standing = {
  rank: number
  slug: string
  nama: string
  angkatan: number
  /** All-time wins, including seasons that are not published as pages. */
  totalMenang: number
  /** Wins among this season's published challenges. */
  musim: number
  streak: number
}

type LeaderboardProps = {
  standings: readonly Standing[]
  /** Wins recorded this season, across everyone. */
  seasonWins: number
}

function Meter({ standing, max, index }: { standing: Standing; max: number; index: number }) {
  return (
    <span className="flex items-center gap-1 text-dim">
      <span aria-hidden>[</span>
      <MeterBar
        value={standing.totalMenang}
        max={max}
        striped
        delay={index * 0.06}
        label={`${standing.totalMenang} dari ${max} kemenangan terbanyak`}
        thick
      />
      <span aria-hidden>]</span>
    </span>
  )
}

/**
 * All-time standings as `htop` would print them: a summary header, an
 * inverted column bar, one process per champion, and a gauge per row.
 *
 * Two renderings of the same rows. From `md` up it is a real table, because
 * this is tabular data and a table is how assistive tech navigates it; on
 * tablets it drops the cohort column, which every winner's card still shows,
 * so names get the room. Below `md`, where the columns cannot fit, each
 * champion becomes a two-line entry — rank and name, then the gauge and the
 * numbers — rather than a table scrolled sideways. Only one of the two is ever
 * displayed, so only one is in the accessibility tree.
 */
export function Leaderboard({ standings, seasonWins }: LeaderboardProps) {
  const max = Math.max(...standings.map((standing) => standing.totalMenang), 1)
  const record = standings[0]?.totalMenang ?? 0

  return (
    <TerminalWindow title="~/hall-of-fame — htop" tone="code" bodyClassName="p-0">
      <dl className="flex flex-wrap gap-x-6 gap-y-1 border-b-2 border-line-soft px-4 py-3 font-mono text-xs leading-6 sm:px-6">
        {[
          ['Juara', `${standings.length} orang`],
          ['Kemenangan musim ini', String(seasonWins)],
          ['Rekor', `${record} menang`],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="text-accent-fg">{label}:</dt>
            <dd className="text-fg">{value}</dd>
          </div>
        ))}
      </dl>

      <table className="hidden w-full border-collapse font-mono text-[13px] leading-6 md:table">
        <caption className="sr-only">Papan peringkat sepanjang masa</caption>
        <thead>
          <tr className="bg-accent text-left text-[11px] tracking-[0.08em] text-accent-ink uppercase">
            <th scope="col" className="w-12 px-3 py-1.5 text-right font-bold lg:w-16 lg:px-4">#</th>
            <th scope="col" className="px-3 py-1.5 font-bold lg:px-4">nama</th>
            <th scope="col" className="hidden w-24 px-4 py-1.5 font-bold lg:table-cell">angkatan</th>
            <th scope="col" className="w-[4.5rem] px-3 py-1.5 text-right font-bold lg:w-20 lg:px-4">total</th>
            <th scope="col" className="w-[4.5rem] px-3 py-1.5 text-right font-bold lg:w-20 lg:px-4">musim</th>
            <th scope="col" className="w-[4.5rem] px-3 py-1.5 text-right font-bold lg:w-20 lg:px-4">streak</th>
            <th scope="col" className="w-[22%] px-3 py-1.5 font-bold lg:w-[30%] lg:px-4">meter</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing, index) => (
            <tr key={standing.slug} className="border-b-2 border-line-soft transition-colors last:border-b-0 hover:bg-surface-2">
              <td className="px-3 py-2.5 text-right text-dim tabular-nums lg:px-4">{pad2(standing.rank)}</td>
              <th scope="row" className="px-3 py-2.5 text-left font-normal lg:px-4">
                <Link
                  href={`/hall-of-fame/${standing.slug}`}
                  className="text-fg decoration-accent-fg decoration-2 underline-offset-4 hover:underline"
                >
                  {standing.nama}
                </Link>
              </th>
              <td className="hidden px-4 py-2.5 text-muted tabular-nums lg:table-cell">{standing.angkatan}</td>
              <td className="px-3 py-2.5 text-right font-bold text-accent-fg tabular-nums lg:px-4">{standing.totalMenang}</td>
              <td className="px-3 py-2.5 text-right text-fg tabular-nums lg:px-4">{standing.musim}</td>
              <td className="px-3 py-2.5 text-right text-fg tabular-nums lg:px-4">{standing.streak}</td>
              <td className="px-3 py-2.5 lg:px-4">
                <Meter standing={standing} max={max} index={index} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ol aria-label="Papan peringkat sepanjang masa" className="md:hidden">
        {standings.map((standing, index) => (
          <li key={standing.slug} className="border-b-2 border-line-soft px-4 py-3 font-mono last:border-b-0">
            <p className="flex items-baseline gap-3 text-sm leading-6">
              <span className="w-6 shrink-0 text-right text-[11px] text-dim tabular-nums">
                <span className="sr-only">Peringkat </span>
                {pad2(standing.rank)}
              </span>
              <Link
                href={`/hall-of-fame/${standing.slug}`}
                className="min-w-0 truncate text-fg decoration-accent-fg decoration-2 underline-offset-4 hover:underline"
              >
                {standing.nama}
              </Link>
            </p>
            <div className="mt-2 pl-9">
              <Meter standing={standing} max={max} index={index} />
              <p className="mt-1.5 text-[11px] leading-5 text-muted">
                <span className="font-bold text-accent-fg">{standing.totalMenang}</span> total ·{' '}
                {standing.musim} musim ini · streak {standing.streak}
                {/* Its own line, so a narrow screen never strands a trailing separator. */}
                <span className="block text-dim">angkatan {standing.angkatan}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </TerminalWindow>
  )
}
