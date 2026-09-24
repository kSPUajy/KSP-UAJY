import { Reveal } from '@/components/motion/Reveal'
import { GalleryWall } from '@/components/sections/home/GalleryWall'
import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SectionShell } from '@/components/ui/SectionShell'
import type { GalleryItem } from '@/lib/types'

type GalleryStripProps = {
  index: number
  /** Newest first; the wall cycles through all of them. */
  items: readonly GalleryItem[]
}

/**
 * The home gallery: a wall of CRT monitors (see `GalleryWall`) lying on the
 * cream desk, so it stands apart from the dark join section right after it.
 */
export function GalleryStrip({ index, items }: GalleryStripProps) {
  return (
    <SectionShell accent="lime" tone="paper" labelledBy="galeri-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="galeri"
          title="Siaran ulang dari ruang kelas"
          headingId="galeri-title"
          description="Kelas Senin dan Selasa, workshop, kompetisi, dan sesi-sesi malam sebelum deadline — diputar ulang di setiap monitor. Pilih satu untuk ditonton di layar utama."
          actions={
            items.length > 0 ? (
              <ButtonLink href="/galeri" variant="outline" size="sm">
                buka galeri
              </ButtonLink>
            ) : undefined
          }
        />
      </Reveal>

      <Reveal className="mt-10 sm:mt-12">
        {items.length > 0 ? (
          <GalleryWall items={items} />
        ) : (
          <EmptyState
            command="ls ~/galeri/*.jpg"
            output="ls: tidak ada berkas yang cocok"
            title="Roll pertama belum dicuci"
            description="Dokumentasi kegiatan diunggah divisi media setelah setiap acara. Kelas pertama semester ini tinggal menunggu jadwal."
          />
        )}
      </Reveal>
    </SectionShell>
  )
}
