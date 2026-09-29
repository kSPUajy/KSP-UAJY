import { notFound, redirect } from 'next/navigation'

import { galeriFileBase } from '@/components/sections/galeri/galeri-format'
import { getGalleryItem } from '@/lib/data'

const EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

/**
 * A gallery item's original file — the photo, or the video itself — as a
 * download named after its date and caption.
 *
 * Files in our own public buckets are handed to Supabase with
 * `?download=<name>`, which sends them as an attachment; the bytes never
 * pass through here, so a 50 MB video costs the function nothing. A photo
 * linked from elsewhere is relayed with the same header, since the
 * `download` attribute does nothing across origins. A video linked from
 * elsewhere can only be opened.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getGalleryItem(id)
  if (!item) notFound()

  const source = item.type === 'video' && item.videoUrl ? item.videoUrl : item.src
  const base = galeriFileBase(item)

  if (source.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`)) {
    const url = new URL(source)
    const extension = url.pathname.match(/\.[a-z0-9]{2,4}$/i)?.[0] ?? (item.type === 'video' ? '.mp4' : '.jpg')
    url.searchParams.set('download', `${base}${extension.toLowerCase()}`)
    redirect(url.toString())
  }
  if (item.type === 'video') redirect(source)

  const upstream = await fetch(source, { cache: 'no-store' }).catch(() => null)
  const type = upstream?.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
  if (!upstream?.ok || !upstream.body || !type.startsWith('image/')) redirect(source)

  return new Response(upstream.body, {
    headers: {
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="${base}.${EXTENSION[type] ?? 'jpg'}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
