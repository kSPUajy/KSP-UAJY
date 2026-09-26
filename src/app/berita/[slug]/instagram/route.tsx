import { notFound } from 'next/navigation'

import { getNewsPostBySlug } from '@/lib/data'
import { renderIgCard } from '@/lib/og'

/** Rebuilt at most hourly, like the article it is drawn from. */
export const revalidate = 3600

/**
 * The cover as a data URL, or null when it cannot be drawn: the renderer
 * reads only JPEG and PNG, and a link pasted in the admin panel may point
 * at a WebP or at a host that refuses the request. Uploaded covers are
 * always JPEG, so this is only the safety net.
 */
async function drawableCover(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const type = response.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
    if (!response.ok || (type !== 'image/jpeg' && type !== 'image/png')) return null
    const bytes = Buffer.from(await response.arrayBuffer())
    return `data:${type};base64,${bytes.toString('base64')}`
  } catch {
    return null
  }
}

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
    cover: await drawableCover(post.cover),
    eyebrow: `berita · ${post.kategori}`,
    title: post.judul,
    excerpt: post.excerpt,
    path: `/berita/${post.slug}`,
  })
  image.headers.set('Content-Disposition', `inline; filename="kabar-ksp-${post.slug}.png"`)
  return image
}
