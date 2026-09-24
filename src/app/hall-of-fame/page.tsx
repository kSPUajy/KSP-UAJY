import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { Leaderboard } from '@/components/sections/hall-of-fame/Leaderboard'
import type { Standing } from '@/components/sections/hall-of-fame/Leaderboard'
import { Podium } from '@/components/sections/hall-of-fame/Podium'
import { WeeklyChampions } from '@/components/sections/hall-of-fame/WeeklyChampions'
import type { WeeklyChampion } from '@/components/sections/hall-of-fame/WeeklyChampions'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getChallenges, getLeaderboard, getWinnerProfiles, getWinners } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Hall of Fame',
  description: `Juara challenge mingguan ${siteConfig.name}: papan peringkat sepanjang masa, streak terpanjang, dan solusi yang menang.`,
  path: '/hall-of-fame',
})

export default async function HallOfFamePage() {
  const [leaderboard, profiles, winners, challenges] = await Promise.all([
    getLeaderboard(),
    getWinnerProfiles(),
    getWinners(),
    getChallenges(),
  ])

  const seasonWinsBySlug = new Map(profiles.map((profile) => [profile.slug, profile.wins.length]))
  const standings: Standing[] = leaderboard.map((row) => ({
    rank: row.rank,
    slug: row.slug,
    nama: row.nama,
    angkatan: row.angkatan,
    totalMenang: row.totalMenang,
    musim: seasonWinsBySlug.get(row.slug) ?? 0,
    streak: row.streak,
  }))

  const challengeById = new Map(challenges.map((challenge) => [challenge.id, challenge]))
  const weeks: WeeklyChampion[] = [...winners]
    .sort((a, b) => a.minggu - b.minggu)
    .flatMap((winner) => {
      const challenge = challengeById.get(winner.challengeId)
      if (!challenge) return []
      return [
        {
          minggu: winner.minggu,
          challengeSlug: challenge.slug,
          challengeTitle: challenge.judul,
          winnerSlug: winner.slug,
          winnerName: winner.nama,
          runtimeMs: winner.runtimeMs,
        },
      ]
    })

  const longestStreak = Math.max(0, ...standings.map((standing) => standing.streak))

  return (
    <>
      <PageHeader
        accent="orange"
        command="top -o menang"
        eyebrow="hall of fame"
        title="Yang paling sering menang"
        description={
          standings.length > 0
            ? 'Setiap juara challenge mingguan tercatat di sini — dengan solusi yang menang dan cerita di baliknya. Total dihitung sepanjang masa, termasuk musim yang soalnya tidak diarsipkan di situs ini.'
            : undefined
        }
        facts={
          standings.length > 0
            ? [
                { label: 'juara', value: standings.length },
                { label: 'minggu_diputuskan', value: weeks.length },
                { label: 'streak_terpanjang', value: longestStreak },
              ]
            : undefined
        }
      />

      {standings.length > 0 ? (
        <>
          <SectionShell accent="orange" tone="tint" divider={false} labelledBy="tiga-besar">
            <Reveal>
              <SectionHeader eyebrow="podium" title="Tiga besar" headingId="tiga-besar" align="center" />
            </Reveal>
            <div className="mt-12">
              <Podium entries={leaderboard.slice(0, 3)} />
            </div>
          </SectionShell>

          <SectionShell accent="orange" tone="canvas" labelledBy="papan-peringkat">
            <Reveal>
              <SectionHeader
                eyebrow="papan peringkat"
                title="Sepanjang masa"
                headingId="papan-peringkat"
                description="Diurutkan menurut total kemenangan, lalu streak terpanjang, lalu siapa yang lebih dulu sampai — tidak pernah menurut abjad."
              />
            </Reveal>
            <Reveal className="mt-10">
              <Leaderboard standings={standings} seasonWins={winners.length} />
            </Reveal>
          </SectionShell>

          {weeks.length > 0 ? (
            <SectionShell accent="orange" tone="inverse" labelledBy="juara-mingguan">
              <Reveal>
                <SectionHeader
                  eyebrow="juara per minggu"
                  title="Musim ini, minggu demi minggu"
                  headingId="juara-mingguan"
                  description="Buka soalnya untuk membaca solusi yang menang, atau buka juaranya untuk melihat semua kemenangannya."
                />
              </Reveal>
              <Reveal className="mt-10 max-w-4xl">
                <WeeklyChampions weeks={weeks} />
              </Reveal>
            </SectionShell>
          ) : null}
        </>
      ) : (
        <SectionShell accent="orange" tone="tint" divider={false}>
          <EmptyState
            accent="orange"
            command="top -o menang"
            output="0 proses"
            title="Belum ada juara"
            description="Juara pertama musim ini diumumkan Selasa setelah deadline challenge minggu pertama."
            action={
              <ButtonLink href="/challenge" variant="outline" size="sm">
                lihat challenge
              </ButtonLink>
            }
          />
        </SectionShell>
      )}
    </>
  )
}
