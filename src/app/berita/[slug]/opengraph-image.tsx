import { getNewsPostBySlug, getNewsPosts } from '@/lib/data'
import { formatTanggal } from '@/lib/format'
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from '@/lib/og'

export const alt = 'Kartu berita Kelompok Studi Pemrograman'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/** Same slugs as the page, so every card is drawn at build time. */
export async function generateStaticParams() {
  const posts = await getNewsPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getNewsPostBySlug(slug)
  const file = post ? `~/berita/${post.tanggal.slice(0, 7)}/${post.slug}.md` : '~/berita/'
  return renderOgCard({
    accent: 'amber',
    file,
    command: `less ${file}`,
    eyebrow: post ? `berita · ${post.kategori}` : 'berita',
    title: post?.judul ?? 'Berita',
    subtitle: post ? `oleh ${post.penulis} · ${formatTanggal(post.tanggal)}` : undefined,
  })
}
