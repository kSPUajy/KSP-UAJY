import { notFound } from 'next/navigation'

import { galeriFileBase, galeriPath } from '@/components/sections/galeri/galeri-format'
import { getGalleryItem } from '@/lib/data'
import { formatTanggal } from '@/lib/format'
import { drawableImage, renderIgPhotoCard } from '@/lib/og'

/** Rebuilt at most hourly, like the gallery it is drawn from. */
export const revalidate = 3600

/**
 * A gallery item as a 1080 × 1350 PNG for Instagram: the whole photo (a
 * video's poster under a play button), its category, date and caption, and
 * the link to the gallery. The lightbox's share button fetches this and
 * hands it to the phone's share sheet.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getGalleryItem(id)
  if (!item) notFound()
  const image = await renderIgPhotoCard({
    photo: await drawableImage(item.src),
    width: item.width,
    height: item.height,
    video: item.type === 'video',
    eyebrow: `galeri · ${item.type === 'video' ? 'video · ' : ''}${item.kategori}`,
    date: formatTanggal(item.tanggal),
    caption: item.caption || item.alt,
    file: galeriPath(item),
  })
  image.headers.set('Content-Disposition', `inline; filename="${galeriFileBase(item)}-instagram.png"`)
  return image
}
