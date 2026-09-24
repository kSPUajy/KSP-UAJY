import { getLeaderboard, getWinnerProfile, getWinnerProfiles } from '@/lib/data'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'
import { pad2, snakeCase } from '@/lib/utils'

export const alt = 'Kartu juara hall of fame'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Same slugs as the page, so every card is drawn at build time. */
export async function generateStaticParams() {
  const profiles = await getWinnerProfiles()
  return profiles.map((profile) => ({ slug: profile.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [profile, leaderboard] = await Promise.all([getWinnerProfile(slug), getLeaderboard()])
  const rank = leaderboard.find((row) => row.slug === slug)?.rank
  const file = `~/hall-of-fame/${snakeCase(slug)}.card`
  return renderOgCard({
    accent: 'orange',
    file,
    command: `cat ${file}`,
    eyebrow: rank ? `hall of fame · #${pad2(rank)}` : 'hall of fame',
    title: profile?.nama ?? 'Hall of Fame',
    subtitle: profile
      ? `${profile.totalMenang}× juara challenge mingguan · streak terpanjang ${profile.streak} minggu`
      : undefined,
  })
}
