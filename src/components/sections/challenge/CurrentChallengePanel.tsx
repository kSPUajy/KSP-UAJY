import Link from 'next/link'

import { Countdown } from '@/components/sections/challenge/Countdown'
import { Badge, DifficultyBadge, Tag } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { StructBlock } from '@/components/ui/StructBlock'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { isChallengeClosed } from '@/lib/data'
import { formatTanggalPendek, formatTanggalWaktu, namaHari } from '@/lib/format'
import type { ChallengeMeta, Winner } from '@/lib/types'
import { pad2 } from '@/lib/utils'

type CurrentChallengePanelProps = {
  challenge: ChallengeMeta
  /** Plain-text opening of the problem statement. */
  teaser: string
  /** This challenge's winner, once decided. Shown when the countdown closes. */
  winner: Winner | null
}

/**
 * The week on the clock, given the most room on the page: statement teaser on
 * the left, a live countdown and the metadata on the right.
 *
 * Only the countdown is a Client Component. Everything else is rendered on
 * the server, including the closed state, which is handed to the countdown
 * pre-rendered so it can swap in the moment the deadline passes.
 */
export function CurrentChallengePanel({ challenge, teaser, winner }: CurrentChallengePanelProps) {
  const href = `/challenge/${challenge.slug}`
  const week = pad2(challenge.minggu)

  const closed = (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
      <Badge variant="ghost" size="sm">
        ditutup
      </Badge>
      {winner ? (
        <span>
          pemenang:{' '}
          <Link
            href={`/hall-of-fame/${winner.slug}`}
            className="text-fg underline decoration-accent-fg decoration-2 underline-offset-4 hover:text-accent-fg"
          >
            {winner.nama}
          </Link>
        </span>
      ) : (
        <span>penilaian berlangsung — pemenang diumumkan Selasa</span>
      )}
    </p>
  )

  return (
    <TerminalWindow title={`~/challenge/minggu-${week}/soal.md`} bodyClassName="p-0">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
              minggu {week}
            </p>
            <DifficultyBadge difficulty={challenge.difficulty} />
          </div>

          <h3 className="mt-5 text-2xl leading-tight font-bold tracking-tight text-fg sm:text-[1.75rem]">
            <Link href={href} className="transition-colors hover:text-accent-fg">
              {challenge.judul}
            </Link>
          </h3>

          <ul aria-label="Topik" className="mt-4 flex flex-wrap gap-2">
            {challenge.topik.map((topik) => (
              <li key={topik}>
                <Tag>{topik}</Tag>
              </li>
            ))}
          </ul>

          {teaser ? <p className="mt-6 max-w-prose text-sm leading-7 text-muted">{teaser}</p> : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href={href}>baca soal lengkap</ButtonLink>
            <ButtonLink href="/challenge" variant="outline">
              arsip challenge
            </ButtonLink>
          </div>
        </div>

        <div className="border-t-2 border-line-soft bg-surface-2 p-5 sm:p-8 lg:border-t-0 lg:border-l-2">
          <p className="text-[11px] leading-5 text-dim">{'// sisa waktu'}</p>

          <Countdown
            className="mt-4"
            deadline={challenge.deadline}
            deadlineLabel={`${namaHari(challenge.deadline)}, ${formatTanggalWaktu(challenge.deadline)}`}
            closed={closed}
            closedAtRender={isChallengeClosed(challenge)}
          />

          <StructBlock
            className="mt-8"
            type="challenge"
            name={`minggu_${week}`}
            label={`Detail challenge minggu ${challenge.minggu}`}
            fields={[
              {
                key: 'rilis',
                value: `${namaHari(challenge.tanggalRilis)}, ${formatTanggalPendek(challenge.tanggalRilis)}`,
              },
              { key: 'peserta', value: challenge.totalPeserta },
              { key: 'contoh_io', value: challenge.sampleIO.length },
              { key: 'hint', value: challenge.hintTerkunci.length },
            ]}
          />
        </div>
      </div>
    </TerminalWindow>
  )
}
