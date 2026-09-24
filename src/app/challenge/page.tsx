import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { ChallengeArchive } from '@/components/sections/challenge/ChallengeArchive'
import { CurrentChallengePanel } from '@/components/sections/challenge/CurrentChallengePanel'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { ChallengeListItem } from '@/lib/challenge-list'
import {
  getChallengeBySlug,
  getChallenges,
  getCurrentChallenge,
  getWinners,
  isChallengeClosed,
} from '@/lib/data'
import { mdxExcerpt } from '@/lib/excerpt'
import { pageMetadata } from '@/lib/metadata'
import { TOPIK } from '@/lib/types'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Challenge',
  description: `Arsip challenge mingguan ${siteConfig.name}: soal C dari MUDAH sampai SEGFAULT, lengkap dengan sample I/O, petunjuk, dan solusi pemenang.`,
  path: '/challenge',
})

/** Which weeks are closed depends on the clock; regenerate hourly. */
export const revalidate = 3600

export default async function ChallengeArchivePage() {
  const [challenges, winners, current] = await Promise.all([
    getChallenges(),
    getWinners(),
    getCurrentChallenge(),
  ])

  const winnerById = new Map(winners.map((winner) => [winner.id, winner]))

  const items: ChallengeListItem[] = challenges.map((challenge) => {
    const winner = challenge.pemenangId ? winnerById.get(challenge.pemenangId) : undefined
    return {
      slug: challenge.slug,
      minggu: challenge.minggu,
      judul: challenge.judul,
      difficulty: challenge.difficulty,
      topik: challenge.topik,
      tanggalRilis: challenge.tanggalRilis,
      deadline: challenge.deadline,
      totalPeserta: challenge.totalPeserta,
      closed: isChallengeClosed(challenge),
      winner: winner ? { nama: winner.nama, slug: winner.slug, runtimeMs: winner.runtimeMs } : null,
    }
  })

  const topics = TOPIK.filter((topic) => challenges.some((challenge) => challenge.topik.includes(topic)))
  const open = items.filter((item) => !item.closed).length
  const submissions = items.reduce((total, item) => total + item.totalPeserta, 0)

  // Only a week still on the clock is featured; a closed one is just a row.
  const currentOpen = current && !isChallengeClosed(current) ? current : null
  const currentBody = currentOpen ? await getChallengeBySlug(currentOpen.slug) : null

  return (
    <>
      <PageHeader
        accent="magenta"
        command="ls ~/challenge"
        eyebrow="challenge"
        title="Arsip challenge mingguan"
        description={
          challenges.length > 0
            ? 'Satu soal tiap Senin, dari MUDAH sampai SEGFAULT. Saring berdasarkan tingkat kesulitan atau topik, lalu buka soalnya — solusi pemenang terbit setelah deadline, lengkap dengan cerita di baliknya.'
            : undefined
        }
        facts={
          challenges.length > 0
            ? [
                { label: 'soal', value: challenges.length },
                { label: 'terbuka', value: open },
                { label: 'submission', value: submissions },
              ]
            : undefined
        }
      />

      {currentOpen ? (
        <SectionShell accent="magenta" tone="tint" divider={false} labelledBy="minggu-ini">
          <Reveal>
            <SectionHeader eyebrow="minggu ini" title="Yang sedang berjalan" headingId="minggu-ini" />
          </Reveal>
          <Reveal className="mt-10">
            <CurrentChallengePanel
              challenge={currentOpen}
              teaser={currentBody ? mdxExcerpt(currentBody.deskripsiMdx) : ''}
              winner={null}
            />
          </Reveal>
        </SectionShell>
      ) : null}

      <SectionShell accent="magenta" tone="canvas" divider={currentOpen !== null} labelledBy="semua-soal">
        <Reveal>
          <SectionHeader eyebrow="arsip" title="Semua soal" headingId="semua-soal" />
        </Reveal>
        <div className="mt-10">
          {items.length > 0 ? (
            <ChallengeArchive items={items} topics={topics} />
          ) : (
            <EmptyState
              command="ls ~/challenge"
              output="0 soal"
              title="Musim baru belum dimulai"
              description="Soal pertama terbit Senin pukul 08.00. Pengumuman jadwal musim berikutnya selalu masuk ke berita lebih dulu."
              action={
                <ButtonLink href="/berita" variant="outline" size="sm">
                  buka berita
                </ButtonLink>
              }
            />
          )}
        </div>
      </SectionShell>
    </>
  )
}
