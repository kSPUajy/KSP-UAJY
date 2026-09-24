import { getChallengeBySlug, getChallenges } from '@/lib/data'
import { mdxExcerpt } from '@/lib/excerpt'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'
import { pad2 } from '@/lib/utils'

export const alt = 'Kartu soal challenge mingguan'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Same slugs as the page, so every card is drawn at build time. */
export async function generateStaticParams() {
  const challenges = await getChallenges()
  return challenges.map((challenge) => ({ slug: challenge.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const challenge = await getChallengeBySlug(slug)
  const week = challenge ? pad2(challenge.minggu) : '00'
  return renderOgCard({
    accent: 'magenta',
    file: `~/challenge/minggu-${week}/soal.md`,
    command: `cat ~/challenge/minggu-${week}/soal.md`,
    eyebrow: challenge ? `minggu ${week} · ${challenge.difficulty}` : 'challenge',
    title: challenge?.judul ?? 'Challenge mingguan',
    subtitle: challenge ? mdxExcerpt(challenge.deskripsiMdx, 120) : undefined,
  })
}
