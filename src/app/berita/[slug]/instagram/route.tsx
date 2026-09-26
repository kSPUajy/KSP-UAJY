import { notFound } from 'next/navigation'

import { getNewsPostBySlug } from '@/lib/data'
import { renderIgCard } from '@/lib/og'

/** Rebuilt at most hourly, like the article it is drawn from. */
export const revalidate = 3600

/**
 * The article as a 1080 × 1350 PNG for Instagram: cover, headline,
 * standfirst, and the link back. The article page's share button fetches
 * this and hands it to the phone's share sheet.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getNewsPostBySlug(slug)
  if (!post) notFound()
  const image = await renderIgCard({
    cover: post.cover,
    eyebrow: `berita · ${post.kategori}`,
    title: post.judul,
    excerpt: post.excerpt,
    path: `/berita/${post.slug}`,
  })
  image.headers.set('Content-Disposition', `inline; filename="kabar-ksp-${post.slug}.png"`)
  return image
}
