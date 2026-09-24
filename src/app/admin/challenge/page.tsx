import type { Metadata } from 'next'
import Link from 'next/link'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { DifficultyBadge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { requireProfile } from '@/lib/auth/session'
import { getChallenges, getWinners, isChallengeClosed } from '@/lib/data'
import { formatTanggalPendek } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Challenge — Admin',
  description: 'Kelola challenge mingguan dan pemenangnya.',
  path: '/admin/challenge',
  noindex: true,
})

export default async function AdminChallengePage() {
  await requireProfile('/admin/challenge', ['admin'])
  const [challenges, winners] = await Promise.all([getChallenges(), getWinners()])
  const winnerByChallenge = new Map(winners.map((winner) => [winner.challengeId, winner]))

  return (
    <>
      <AdminHeading
        command="ls ~/challenge"
        title="Challenge"
        description="Soal, contoh I/O, petunjuk, dan pemenang. Setelah deadline lewat, umumkan pemenang dari halaman edit soalnya."
        actions={
          <ButtonLink href="/admin/challenge/baru" size="sm">
            soal baru
          </ButtonLink>
        }
      />
      <ol className="mt-8 border-t-2 border-line">
        {challenges.map((challenge) => {
          const winner = winnerByChallenge.get(challenge.id)
          const closed = isChallengeClosed(challenge)
          return (
            <li key={challenge.id} className="border-b-2 border-line">
              <Link
                href={`/admin/challenge/${challenge.id}`}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 px-3 py-3.5 transition-colors hover:bg-surface-2 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto_11rem]"
              >
                <span className="font-display text-[11px] tracking-[0.12em] text-accent-fg">W{pad2(challenge.minggu)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-fg">{challenge.judul}</span>
                  <span className="block text-[11px] text-dim">deadline {formatTanggalPendek(challenge.deadline)}</span>
                </span>
                <span className="col-start-2 sm:col-start-auto">
                  <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
                </span>
                <span className="col-start-2 truncate text-[11px] sm:col-start-auto">
                  {winner ? (
                    <span className="text-muted">juara: {winner.nama}</span>
                  ) : closed ? (
                    <span className="text-accent-fg">perlu diumumkan</span>
                  ) : (
                    <span className="text-dim">masih berjalan</span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </>
  )
}
