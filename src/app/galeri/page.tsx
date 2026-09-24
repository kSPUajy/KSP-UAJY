import type { Metadata } from 'next'

import { GalleryExplorer } from '@/components/sections/galeri/GalleryExplorer'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import { getGalleryItems } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { KATEGORI_GALERI } from '@/lib/types'
import { siteConfig } from '@/site.config'

export const metadata: Metadata = pageMetadata({
  title: 'Galeri',
  description: `Dokumentasi kegiatan ${siteConfig.name} ${siteConfig.campus.short}: kelas Jumat sore, workshop, kompetisi, dan gathering.`,
  path: '/galeri',
})

export default async function GaleriPage() {
  const items = await getGalleryItems()

  const categories = KATEGORI_GALERI.filter((kategori) => items.some((item) => item.kategori === kategori))
  const videos = items.filter((item) => item.type === 'video').length
  const years = items.map((item) => Number(item.tanggal.slice(0, 4)))

  return (
    <>
      <PageHeader
        accent="lime"
        command="ls -lt ~/galeri"
        eyebrow="galeri"
        title="Dari ruang kelas dan sekitarnya"
        description={
          items.length > 0
            ? 'Kelas Jumat sore, workshop, kompetisi, dan sesi-sesi malam sebelum deadline — diunggah divisi media setelah setiap acara. Pilih satu untuk melihatnya utuh, dalam warna aslinya.'
            : undefined
        }
        facts={
          items.length > 0
            ? [
                { label: 'foto', value: items.length - videos },
                { label: 'video', value: videos },
                { label: 'tahun', value: `${Math.min(...years)}..${Math.max(...years)}` },
              ]
            : undefined
        }
      />

      <SectionShell accent="lime" tone="alt" divider={false}>
        {items.length > 0 ? (
          <GalleryExplorer items={items} categories={categories} />
        ) : (
          <EmptyState
            accent="lime"
            command="ls ~/galeri/*.jpg"
            output="ls: tidak ada berkas yang cocok"
            title="Roll pertama belum dicuci"
            description="Dokumentasi kegiatan diunggah divisi media setelah setiap acara. Kelas pertama semester ini tinggal menunggu jadwal."
            action={
              <ButtonLink href="/berita" variant="outline" size="sm">
                baca berita
              </ButtonLink>
            }
          />
        )}
      </SectionShell>
    </>
  )
}
