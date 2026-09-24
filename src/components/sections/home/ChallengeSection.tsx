import Link from 'next/link'

import { Reveal } from '@/components/motion/Reveal'
import { CurrentChallengePanel } from '@/components/sections/challenge/CurrentChallengePanel'
import { ButtonLink } from '@/components/ui/Button'
import { DitherImage } from '@/components/ui/DitherImage'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { PORTRAIT } from '@/lib/types'
import type { ChallengeMeta, Winner } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type ChallengeSectionProps = {
  index: number
  current: ChallengeMeta | null
  teaser: string
  /** The current challenge's own winner, once decided. */
  currentWinner: Winner | null
  /** The last decided week, with the title of the challenge it won. */
  lastWinner: { winner: Winner; challengeTitle: string } | null
}

/**
 * Last week's result, one line under this week's problem. Kept in the
 * section's own accent rather than the hall of fame's orange: it is a footnote
 * to the challenge, not a second section.
 */
function LastWinner({ winner, challengeTitle }: { winner: Winner; challengeTitle: string }) {
  return (
    <div className="group relative mt-8 flex items-center gap-4 border-2 border-line bg-surface p-3 pr-4 transition-colors hover:bg-surface-2 sm:gap-5">
      <DitherImage
        src={winner.foto}
        alt={`Potret ${winner.nama}`}
        width={PORTRAIT.width}
        height={PORTRAIT.height}
        sizes="48px"
        className="aspect-[4/5] w-12 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p className="font-display text-[10px] tracking-[0.16em] text-accent-fg uppercase">
          {`// pemenang minggu ${pad2(winner.minggu)}`}
        </p>
        <p className="mt-1.5 truncate text-sm leading-6 font-bold text-fg">
          <Link
            href={`/hall-of-fame/${winner.slug}`}
            className="decoration-accent-fg decoration-2 underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-['']"
          >
            {winner.nama}
          </Link>
        </p>
        <p className="text-[11px] leading-5 text-dim">
          {challengeTitle}
          {winner.runtimeMs !== undefined ? ` · ${winner.runtimeMs} ms` : ''} · {winner.totalMenang}×
          menang
        </p>
      </div>

      <span aria-hidden className="shrink-0 text-sm text-accent-fg transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
        -&gt;
      </span>
    </div>
  )
}

export function ChallengeSection({
  index,
  current,
  teaser,
  currentWinner,
  lastWinner,
}: ChallengeSectionProps) {
  return (
    <SectionShell accent="magenta" tone="tint" divider={false} labelledBy="challenge-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="challenge minggu ini"
          title="Satu soal tiap Senin"
          headingId="challenge-title"
          description="Kerjakan sebelum Minggu pukul 23.59. Pemenang dan pembahasannya terbit Selasa berikutnya, lengkap dengan kodenya."
          actions={
            <ButtonLink href="/hall-of-fame" variant="outline" size="sm">
              hall of fame
            </ButtonLink>
          }
        />
      </Reveal>

      <Reveal className="mt-10 sm:mt-12">
        {current ? (
          <CurrentChallengePanel challenge={current} teaser={teaser} winner={currentWinner} />
        ) : (
          <EmptyState
            command="ls ~/challenge"
            output="0 soal terbit"
            title="Belum ada soal minggu ini"
            description="Soal baru terbit setiap Senin pukul 08.00. Jadwal dan pengumuman musim berikutnya selalu masuk ke berita lebih dulu."
            action={
              <ButtonLink href="/berita" variant="outline" size="sm">
                buka berita
              </ButtonLink>
            }
          />
        )}

        {lastWinner && lastWinner.winner.challengeId !== current?.id ? (
          <LastWinner winner={lastWinner.winner} challengeTitle={lastWinner.challengeTitle} />
        ) : null}
      </Reveal>
    </SectionShell>
  )
}
