import { DIFFICULTIES } from '@/lib/types'
import type { Difficulty, Topik } from '@/lib/types'

/**
 * What the archive list needs about one challenge — flat and serialisable,
 * so the server can hand it straight to the client-side filter.
 */
export type ChallengeListItem = {
  slug: string
  minggu: number
  judul: string
  difficulty: Difficulty
  topik: Topik[]
  tanggalRilis: string
  deadline: string
  totalPeserta: number
  /** Decided when the page was generated; the page regenerates hourly. */
  closed: boolean
  winner: { nama: string; slug: string; runtimeMs?: number } | null
}

export const SORTS = {
  terbaru: 'minggu terbaru',
  terlama: 'minggu terlama',
  tersulit: 'paling sulit',
  peserta: 'peserta terbanyak',
} as const

export type SortKey = keyof typeof SORTS

export type ChallengeFilter = {
  difficulty: Difficulty | null
  topik: Topik | null
  sort: SortKey
}

const difficultyRank = (difficulty: Difficulty): number => DIFFICULTIES.indexOf(difficulty)

export function isDifficulty(value: string | null): value is Difficulty {
  return value !== null && (DIFFICULTIES as readonly string[]).includes(value)
}

export function isSortKey(value: string | null): value is SortKey {
  // Own keys only: `in` would also accept `toString` and friends from the prototype.
  return value !== null && Object.hasOwn(SORTS, value)
}

/** Filters, then sorts. Ties always fall back to the newest week first. */
export function applyChallengeFilter(
  items: readonly ChallengeListItem[],
  { difficulty, topik, sort }: ChallengeFilter,
): ChallengeListItem[] {
  const filtered = items.filter(
    (item) => (!difficulty || item.difficulty === difficulty) && (!topik || item.topik.includes(topik)),
  )

  const byWeekDesc = (a: ChallengeListItem, b: ChallengeListItem): number => b.minggu - a.minggu

  return filtered.sort((a, b) => {
    switch (sort) {
      case 'terlama':
        return a.minggu - b.minggu
      case 'tersulit':
        return difficultyRank(b.difficulty) - difficultyRank(a.difficulty) || byWeekDesc(a, b)
      case 'peserta':
        return b.totalPeserta - a.totalPeserta || byWeekDesc(a, b)
      case 'terbaru':
      default:
        return byWeekDesc(a, b)
    }
  })
}
