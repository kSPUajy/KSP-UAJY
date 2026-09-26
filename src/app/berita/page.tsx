import type { Metadata } from 'next'

import { Reveal } from '@/components/motion/Reveal'
import { NewsArchive } from '@/components/sections/berita/NewsArchive'
import { NewsLeadCard } from '@/components/sections/berita/NewsLeadCard'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getNewsPosts } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { KATEGORI_BERITA } from '@/lib/types'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Berita',
  description: `Artikel ${siteConfig.name} ${siteConfig.campus.short}: fakta menarik tentang bahasa C, tips dan trik untuk pemula, dan pengumuman penting.`,
  path: '/berita',
})

const LEAD_SIZES = '(min-width: 1440px) 720px, (min-width: 1024px) 52vw, 92vw'

export default async function BeritaPage() {
  const posts = await getNewsPosts()
  const [lead] = posts

  const categories = KATEGORI_BERITA.filter((kategori) => posts.some((post) => post.kategori === kategori))
  const authors = new Set(posts.map((post) => post.penulis))

  return (
    <>
      <PageHeader
        accent="amber"
        command="git log --oneline berita/"
        eyebrow="berita"
        title="Kabar dari KSP"
        description={
          posts.length > 0
            ? 'Bacaan ringan seputar bahasa C: fakta menarik, tips dan trik untuk pemula, sampai pengumuman penting dari KSP. Cocok dibaca sambil menunggu kelas dimulai.'
            : undefined
        }
        facts={
          posts.length > 0
            ? [
                { label: 'tulisan', value: posts.length },
                { label: 'kategori', value: categories.length },
                { label: 'penulis', value: authors.size },
              ]
            : undefined
        }
      />

      {lead ? (
        <>
          <SectionShell accent="amber" tone="tint" divider={false} labelledBy="terbaru">
            <Reveal>
              <SectionHeader eyebrow="HEAD" title="Paling baru" headingId="terbaru" />
            </Reveal>
            <Reveal className="mt-10">
              <NewsLeadCard post={lead} sizes={LEAD_SIZES} layout="split" />
            </Reveal>
          </SectionShell>

          <SectionShell accent="amber" tone="canvas" labelledBy="arsip-berita">
            <Reveal>
              <SectionHeader
                eyebrow="arsip"
                title="Semua tulisan"
                headingId="arsip-berita"
                description="Saring menurut kategori, atau cari kata di judul, ringkasan, penulis, dan tag."
              />
            </Reveal>
            <div className="mt-10">
              <NewsArchive posts={posts} categories={categories} />
            </div>
          </SectionShell>
        </>
      ) : (
        <SectionShell accent="amber" tone="tint" divider={false}>
          <EmptyState
            accent="amber"
            command="git log berita/"
            output="fatal: belum ada commit"
            title="Belum ada berita"
            description="Pengumuman pertama biasanya terbit bersamaan dengan pembukaan pendaftaran anggota baru."
            action={
              <ButtonLink href="/gabung" variant="outline" size="sm">
                cara bergabung
              </ButtonLink>
            }
          />
        </SectionShell>
      )}
    </>
  )
}
