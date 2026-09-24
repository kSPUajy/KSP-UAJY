import { Reveal } from '@/components/motion/Reveal'
import { GaleriStudio } from '@/components/sections/home/GaleriStudio'
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
 * The home gallery: a desktop and a dot-matrix printer on the cream desk (see
 * `GaleriStudio`), so it stands apart from the dark join section after it.
 */
export function GalleryStrip({ index, items }: GalleryStripProps) {
  return (
    <SectionShell accent="magenta" tone="paper" labelledBy="galeri-title">
      <Reveal>
        <SectionHeader
          index={index}
          eyebrow="galeri"
          title="Dari layar ke kertas"
          headingId="galeri-title"
          description="Kelas Senin dan Selasa, workshop, kompetisi, dan sesi-sesi malam sebelum deadline. Seret fotonya ke printer untuk mencetaknya ke meja."
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
          <GaleriStudio items={items.filter((item) => item.type === 'image')} />
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
