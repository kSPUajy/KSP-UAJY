import type { Metadata } from 'next'

import { AboutSection } from '@/components/sections/home/AboutSection'
import { ChallengeSection } from '@/components/sections/home/ChallengeSection'
import { FeedbackSection } from '@/components/sections/home/FeedbackSection'
import { GalleryStrip } from '@/components/sections/home/GalleryStrip'
import { Hero } from '@/components/sections/home/Hero'
import { JoinCta } from '@/components/sections/home/JoinCta'
import { LinkEvent } from '@/components/sections/home/LinkEvent'
import { NewsSection } from '@/components/sections/home/NewsSection'
import { TentorTeaser } from '@/components/sections/home/TentorTeaser'
import { JsonLd, organizationLd } from '@/components/seo/JsonLd'
import { Marquee } from '@/components/ui/Marquee'
import {
  getAllChallenges,
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
  isChallengeReleased,
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

  const [currentBody, currentWinner, lastWinnerChallenge, allChallenges] = await Promise.all([
    current ? getChallengeBySlug(current.slug) : null,
    current?.pemenangId ? getWinnerById(current.pemenangId) : null,
    lastWinner ? getChallengeById(lastWinner.challengeId) : null,
    getAllChallenges(),
  ])
  // Only its date and module are shown, never the title, until it is out.
  const nextChallenge =
    [...allChallenges].filter((challenge) => !isChallengeReleased(challenge)).sort((a, b) => a.minggu - b.minggu)[0] ?? null

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
      <LinkEvent index={3} />
      <TentorTeaser index={4} tentors={tentors} schedule={schedule} />
      <NewsSection
        index={5}
        posts={posts}
        schedule={schedule}
        current={current}
        nextChallenge={nextChallenge}
        registration={registration}
      />
      <GalleryStrip index={6} items={gallery.slice(0, GALLERY_FRAMES)} />
      <FeedbackSection index={7} />
      <JoinCta index={8} info={joinInfo} registration={registration} />
    </>
  )
}
