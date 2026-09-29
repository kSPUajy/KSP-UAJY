import { slugify } from '@/lib/format'
import type { GalleryItem } from '@/lib/types'

/** `/galeri/2025-09/g-03.jpg`: where the item would sit as a file. */
export const galeriPath = (item: Pick<GalleryItem, 'id' | 'tanggal' | 'type'>): string =>
  `/galeri/${item.tanggal.slice(0, 7)}/${item.id}.${item.type === 'video' ? 'mp4' : 'jpg'}`

/**
 * `ksp-galeri-2025-09-12-workshop-perdana-semester-ganjil`: a download's
 * name without its extension, from the date and the start of the caption
 * (the category when there is no caption).
 */
export function galeriFileBase(item: Pick<GalleryItem, 'tanggal' | 'caption' | 'kategori'>): string {
  const slug = slugify(item.caption)
  const short = slug.length <= 40 ? slug : slug.slice(0, 40).replace(/-[^-]*$/, '')
  return `ksp-galeri-${item.tanggal}-${short || item.kategori}`
}
