import type { Metadata } from 'next'

import { AboutSection } from '@/components/sections/home/AboutSection'
import { ChallengeSection } from '@/components/sections/home/ChallengeSection'
import { GalleryStrip } from '@/components/sections/home/GalleryStrip'
import { Hero } from '@/components/sections/home/Hero'
import { JoinCta } from '@/components/sections/home/JoinCta'
import { NewsSection } from '@/components/sections/home/NewsSection'
import { TentorTeaser } from '@/components/sections/home/TentorTeaser'
import { JsonLd, organizationLd } from '@/components/seo/JsonLd'
import { Marquee } from '@/components/ui/Marquee'
import {
  getChallengeById,
  getChallengeBySlug,
  getCurrentChallenge,
  getDriftTokens,
  getGalleryItems,
  getJoinInfo,
  getLatestWinner,
  getMembers,
  getTimeline,
  getNewsPosts,
  getRegistration,
  getStats,
  getTentors,
  getTickerTokens,
  getWinnerById,
} from '@/lib/data'
import { mdxExcerpt } from '@/lib/excerpt'
import { pageMetadata } from '@/lib/metadata'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  description: siteConfig.description,
  path: '/',
})

/**
 * Which week is "this week" depends on the clock, and this page is static.
 * Regenerating it hourly keeps the featured challenge at most an hour behind
 * a rollover; the countdown itself runs on the reader's clock and closes on
 * time regardless.
 */
export const revalidate = 3600

/** The wall cycles through this many of the newest photos. */
const GALLERY_FRAMES = 30

export default async function HomePage() {
  const [stats, driftTokens, tickerTokens, current, tentors, posts, gallery, joinInfo, lastWinner, registration, schedule, pengurus] =
    await Promise.all([
      getStats(),
      getDriftTokens(),
      getTickerTokens(),
      getCurrentChallenge(),
      getTentors(),
      getNewsPosts(),
      getGalleryItems(),
      getJoinInfo(),
      getLatestWinner(),
      getRegistration(),
      getTimeline(),
      getMembers(),
    ])

  const [currentBody, currentWinner, lastWinnerChallenge] = await Promise.all([
    current ? getChallengeBySlug(current.slug) : null,
    current?.pemenangId ? getWinnerById(current.pemenangId) : null,
    lastWinner ? getChallengeById(lastWinner.challengeId) : null,
  ])

  return (
    <>
      <JsonLd data={organizationLd} />
      <Hero
        stats={stats}
        driftTokens={driftTokens}
        registrationOpen={registration.status === 'buka'}
        schedule={schedule}
      />
      <Marquee items={tickerTokens} accent="magenta" />

      <AboutSection index={1} pengurus={pengurus.filter((member) => member.divisi === 'inti')} />

      <ChallengeSection
        index={2}
        current={current}
        teaser={currentBody ? mdxExcerpt(currentBody.deskripsiMdx) : ''}
        currentWinner={currentWinner}
        lastWinner={
          lastWinner && lastWinnerChallenge
            ? { winner: lastWinner, challengeTitle: lastWinnerChallenge.judul }
            : null
        }
      />
      <TentorTeaser index={3} tentors={tentors} schedule={schedule} />
      <NewsSection index={4} posts={posts} />
      <GalleryStrip index={5} items={gallery.slice(0, GALLERY_FRAMES)} />
      <JoinCta index={6} info={joinInfo} registration={registration} />
    </>
  )
}
