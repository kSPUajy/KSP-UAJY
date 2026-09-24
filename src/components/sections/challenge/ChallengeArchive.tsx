'use client'

import { AnimatePresence, motion } from 'motion/react'

import { CALM, mech } from '@/components/motion/variants'
import { ChallengeRow } from '@/components/sections/challenge/ChallengeRow'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CommandBar, Flag } from '@/components/ui/Flag'
import {
  SORTS,
  applyChallengeFilter,
  isDifficulty,
  isSortKey,
} from '@/lib/challenge-list'
import type { ChallengeListItem, SortKey } from '@/lib/challenge-list'
import { useQueryParams } from '@/lib/hooks/useQueryParams'
import { useMotionMode } from '@/lib/hooks/useReducedMotion'
import { DIFFICULTIES } from '@/lib/types'
import type { Topik } from '@/lib/types'

type ChallengeArchiveProps = {
  items: readonly ChallengeListItem[]
  /** Every topic that at least one challenge carries, in display order. */
  topics: readonly Topik[]
}

/**
 * The whole archive with its filter, written as a command line:
 *
 *     $ ./challenge --difficulty=SULIT --topik=pointer --sort=terbaru
 *
 * The filter lives in the query string, so a filtered list is a link. The
 * server ships every challenge unfiltered; the URL's filter is applied after
 * hydration. Rows glide to their new places when the order changes — a
 * `layout` animation, which is transform-based — and simply swap under
 * reduced motion.
 */
export function ChallengeArchive({ items, topics }: ChallengeArchiveProps) {
  const { params, setParams } = useQueryParams()
  const mode = useMotionMode()

  const rawDifficulty = params.get('difficulty')
  const rawTopik = params.get('topik')
  const rawSort = params.get('sort')

  const difficulty = isDifficulty(rawDifficulty) ? rawDifficulty : null
  const topik = topics.find((topic) => topic === rawTopik) ?? null
  const sort: SortKey = isSortKey(rawSort) ? rawSort : 'terbaru'

  const visible = applyChallengeFilter(items, { difficulty, topik, sort })
  const filtered = difficulty !== null || topik !== null
  const animate = mode === 'full'

  const reset = (): void => setParams({ difficulty: null, topik: null, sort: null })

  return (
    <div>
      <CommandBar
        command="./challenge"
        trailing={
          filtered || sort !== 'terbaru' ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              reset
            </Button>
          ) : null
        }
      >
        <Flag
          name="difficulty"
          description="tingkat kesulitan"
          value={difficulty ?? ''}
          onChange={(value) => setParams({ difficulty: value || null })}
          options={[{ value: '', label: 'semua' }, ...DIFFICULTIES.map((value) => ({ value, label: value }))]}
        />
        <Flag
          name="topik"
          description="topik"
          value={topik ?? ''}
          onChange={(value) => setParams({ topik: value || null })}
          options={[{ value: '', label: 'semua' }, ...topics.map((value) => ({ value, label: value }))]}
        />
        <Flag
          name="sort"
          description="urutan"
          value={sort}
          onChange={(value) => setParams({ sort: value === 'terbaru' ? null : value })}
          options={Object.entries(SORTS).map(([value, label]) => ({ value, label: `${value} (${label})` }))}
        />
      </CommandBar>

      <p aria-live="polite" className="mt-6 text-[11px] leading-5 text-dim">
        {`// ${visible.length} dari ${items.length} challenge`}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-3 border-2 border-line bg-surface">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((item) => (
              <motion.li
                key={item.slug}
                layout={animate ? 'position' : false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={animate ? mech(0.35) : CALM}
                className="border-b-2 border-line-soft last:border-b-0"
              >
                <ChallengeRow item={item} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <EmptyState
          className="mt-6"
          command={`./challenge${difficulty ? ` --difficulty=${difficulty}` : ''}${topik ? ` --topik=${topik}` : ''}`}
          output="0 hasil"
          title="Tidak ada soal yang cocok"
          description="Kombinasi filter ini terlalu sempit. Longgarkan tingkat kesulitan atau topiknya."
          action={
            <Button variant="outline" size="sm" onClick={reset}>
              reset filter
            </Button>
          }
        />
      )}
    </div>
  )
}
