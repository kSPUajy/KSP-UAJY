import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Reveal } from '@/components/motion/Reveal'
import { SolutionTabs } from '@/components/sections/challenge/SolutionTabs'
import { DitherImage } from '@/components/ui/DitherImage'
import { Prompt } from '@/components/ui/Prompt'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import {
  getChallenges,
  getLeaderboard,
  getMemberBySlug,
  getTentorBySlug,
  getWinnerProfile,
  getWinnerProfiles,
} from '@/lib/data'
import { formatTanggalWaktu } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { PORTRAIT } from '@/lib/types'
import { cn, pad2, snakeCase } from '@/lib/utils'

type WinnerPageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Slugs added in the admin panel after a build are rendered on first visit
 * instead of 404ing; an unknown slug still ends in `notFound()`.
 */
export const dynamicParams = true

export async function generateStaticParams() {
  const profiles = await getWinnerProfiles()
  return profiles.map((profile) => ({ slug: profile.slug }))
}

export async function generateMetadata({ params }: WinnerPageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getWinnerProfile(slug)
  const latest = profile?.wins[0]
  if (!profile || !latest) return {}
  return pageMetadata({
    title: `${profile.nama} — Hall of Fame`,
    description: `${profile.totalMenang}× juara challenge mingguan. “${latest.quote}”`,
    path: `/hall-of-fame/${profile.slug}`,
  })
}

export default async function WinnerCardPage({ params }: WinnerPageProps) {
  const { slug } = await params
  const profile = await getWinnerProfile(slug)
  const latest = profile?.wins[0]
  if (!profile || !latest) notFound()

  const [leaderboard, challenges, member, tentor] = await Promise.all([
    getLeaderboard(),
    getChallenges(),
    getMemberBySlug(slug),
    getTentorBySlug(slug),
  ])

  const rank = leaderboard.find((row) => row.slug === slug)?.rank ?? 0
  const challengeById = new Map(challenges.map((challenge) => [challenge.id, challenge]))
  const runtimes = profile.wins.flatMap((win) => (win.runtimeMs === undefined ? [] : [win.runtimeMs]))
  const best = runtimes.length > 0 ? Math.min(...runtimes) : null
  const file = `${snakeCase(profile.slug)}.card`

  const stats = [
    { label: 'total menang', value: String(profile.totalMenang) },
    { label: 'musim ini', value: String(profile.wins.length) },
    { label: 'streak terpanjang', value: String(profile.streak) },
    { label: 'runtime terbaik', value: best === null ? '—' : `${best} ms` },
  ]

  return (
    <section data-accent="orange" className="relative border-b-2 border-line bg-canvas dot-grid">
      <div className="relative mx-auto w-full max-w-[1440px] px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8 lg:pb-24">
        <Link
          href="/hall-of-fame"
          className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-accent-fg"
        >
          <span aria-hidden className="text-accent-fg">
            &lt;-
          </span>
          cd ..<span className="sr-only"> — kembali ke hall of fame</span>
        </Link>

        <Prompt className="mt-6">cat ~/hall-of-fame/{file}</Prompt>

        <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-14">
          {/* A card keeps a card's size: on a tablet it would otherwise span the page. */}
          <div className="w-full max-w-sm lg:sticky lg:top-24">
            <TerminalWindow title={`~/hall-of-fame/${file}`}>
              <div className="flex items-center justify-between font-display text-[10px] tracking-[0.16em] uppercase">
                <span className="text-accent-fg">ksp · hall of fame</span>
                <span className="text-dim">
                  #{pad2(rank)}/{pad2(leaderboard.length)}
                </span>
              </div>

              <DitherImage
                src={profile.foto}
                alt={`Potret ${profile.nama}`}
                width={PORTRAIT.width}
                height={PORTRAIT.height}
                sizes="(min-width: 640px) 340px, 90vw"
                eager
                className="mt-4 aspect-[4/5] w-full"
              />

              <h1 className="mt-5 text-2xl leading-tight font-bold tracking-tight text-fg">{profile.nama}</h1>
              <p className="mt-2 text-[11px] leading-5 text-dim">
                angkatan {profile.angkatan}
                {member ? ` · ${member.jabatan.toLowerCase()}` : ''}
              </p>

              <dl className="mt-5 grid grid-cols-2 border-2 border-line-soft">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={cn(
                      'flex flex-col-reverse gap-1 p-3',
                      index % 2 === 0 && 'border-r-2 border-line-soft',
                      index < 2 && 'border-b-2 border-line-soft',
                    )}
                  >
                    <dt className="text-[10px] leading-4 tracking-[0.08em] text-dim uppercase">{stat.label}</dt>
                    <dd className="font-display text-xl leading-none text-accent-fg">{stat.value}</dd>
                  </div>
                ))}
              </dl>

              <figure className="mt-5 font-mono">
                <blockquote className="text-sm leading-6 text-fg italic">
                  <span aria-hidden className="text-syn-comment not-italic">
                    {'/* '}
                  </span>
                  {latest.quote}
                  <span aria-hidden className="text-syn-comment not-italic">
                    {' */'}
                  </span>
                </blockquote>
              </figure>

              {member || tentor ? (
                <div className="mt-5 flex flex-col gap-2 border-t-2 border-line-soft pt-4 text-xs leading-5">
                  {member ? (
                    <Link href={`/struktur#${member.slug}`} className="text-accent-fg hover:underline">
                      lihat di struktur <span aria-hidden>-&gt;</span>
                    </Link>
                  ) : null}
                  {tentor ? (
                    <Link href={`/tentor/${tentor.slug}`} className="text-accent-fg hover:underline">
                      juga tentor — lihat profilnya <span aria-hidden>-&gt;</span>
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </TerminalWindow>
          </div>

          <div className="flex min-w-0 flex-col gap-16">
            {profile.wins.map((win) => {
              const challenge = challengeById.get(win.challengeId)
              const headingId = `menang-minggu-${win.minggu}`
              return (
                <Reveal key={win.id}>
                  <section aria-labelledby={headingId}>
                    <p className="font-display text-[10px] tracking-[0.18em] text-accent-fg uppercase">
                      {`// menang minggu ${pad2(win.minggu)}`}
                    </p>
                    <h2 id={headingId} className="mt-3 text-xl leading-snug font-bold tracking-tight text-fg sm:text-2xl">
                      {challenge ? (
                        <Link
                          href={`/challenge/${challenge.slug}`}
                          className="decoration-accent-fg decoration-2 underline-offset-4 hover:underline"
                        >
                          {challenge.judul}
                        </Link>
                      ) : (
                        `Challenge minggu ${win.minggu}`
                      )}
                    </h2>
                    <p className="mt-2 text-[11px] leading-5 text-dim">
                      dikumpulkan {formatTanggalWaktu(win.waktuSubmit)}
                      {win.runtimeMs !== undefined ? ` · ${win.runtimeMs} ms` : ''}
                      {challenge ? ` · ${challenge.difficulty.toLowerCase()} · ${challenge.totalPeserta} peserta` : ''}
                    </p>
                    <SolutionTabs winner={win} className="mt-6" />
                  </section>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
