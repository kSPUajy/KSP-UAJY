import type { MetadataRoute } from 'next'

import { getChallenges, getNewsPosts, getTentors, getWinnerProfiles } from '@/lib/data'
import { siteConfig } from '@/site.config'

const url = (path: string): string => `${siteConfig.url}${path}`

/** New posts and challenges come from the admin panel; pick them up hourly. */
export const revalidate = 3600

/**
 * Every public page. `/kitchen-sink` is left out on purpose — it is a
 * development specimen sheet and 404s in production.
 *
 * Only content with a real date carries `lastModified`; stamping the build
 * time on everything would tell crawlers that every page changed on every
 * deploy, which teaches them to ignore the field.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, challenges, tentors, winners] = await Promise.all([
    getNewsPosts(),
    getChallenges(),
    getTentors(),
    getWinnerProfiles(),
  ])

  const sections: MetadataRoute.Sitemap = [
    { url: url('/'), changeFrequency: 'weekly', priority: 1 },
    ...siteConfig.nav
      .filter((item) => item.href !== '/')
      .map((item) => ({ url: url(item.href), changeFrequency: 'weekly' as const, priority: 0.8 })),
    { url: url(siteConfig.cta.href), changeFrequency: 'monthly', priority: 0.9 },
  ]

  return [
    ...sections,
    ...posts.map((post) => ({
      url: url(`/berita/${post.slug}`),
      lastModified: post.tanggal,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    ...challenges.map((challenge) => ({
      url: url(`/challenge/${challenge.slug}`),
      lastModified: challenge.tanggalRilis,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...tentors.map((tentor) => ({
      url: url(`/tentor/${tentor.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...winners.map((winner) => ({
      url: url(`/hall-of-fame/${winner.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ]
}
