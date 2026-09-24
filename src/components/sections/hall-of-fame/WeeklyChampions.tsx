import Link from 'next/link'

import { pad2 } from '@/lib/utils'

export type WeeklyChampion = {
  minggu: number
  challengeSlug: string
  challengeTitle: string
  winnerSlug: string
  winnerName: string
  runtimeMs?: number
}

/**
 * Every decided week, oldest first, each pointing two ways: to the problem
 * (where the winning solution is published) and to the person. Two links per
 * row, so no row-wide hit area — each link is exactly as wide as its text.
 */
export function WeeklyChampions({ weeks }: { weeks: readonly WeeklyChampion[] }) {
  return (
    <ol className="border-t-2 border-line-soft font-mono">
      {weeks.map((week) => (
        <li
          key={week.minggu}
          className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-1 border-b-2 border-line-soft py-4 sm:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)_5rem] sm:items-baseline"
        >
          <span className="text-[11px] leading-6 text-dim tabular-nums">
            <span className="sr-only">Minggu </span>
            {pad2(week.minggu)}
          </span>
          <Link
            href={`/challenge/${week.challengeSlug}`}
            className="min-w-0 text-sm leading-6 text-fg decoration-accent-fg decoration-2 underline-offset-4 hover:underline"
          >
            {week.challengeTitle}
          </Link>
          <Link
            href={`/hall-of-fame/${week.winnerSlug}`}
            className="col-start-2 min-w-0 text-[12px] leading-6 text-accent-fg decoration-2 underline-offset-4 hover:underline sm:col-start-3"
          >
            <span className="text-dim">juara </span>
            {week.winnerName}
          </Link>
          <span className="col-start-2 text-[11px] leading-6 text-dim tabular-nums sm:col-start-4 sm:text-right">
            {week.runtimeMs !== undefined ? `${week.runtimeMs} ms` : '—'}
          </span>
        </li>
      ))}
    </ol>
  )
}
