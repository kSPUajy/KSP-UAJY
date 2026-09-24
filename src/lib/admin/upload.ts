'use client'

import { createClient } from '@supabase/supabase-js'

import { mulaiUploadGambar, mulaiUploadVideo } from '@/app/admin/shared-actions'

/** Longest side after shrinking: sharp on any screen, a few hundred KB on disk. */
const MAX_SIDE = 2000

export type ShrunkImage = { blob: Blob; width: number; height: number; type: 'image/jpeg' }

/**
 * A phone photo is often 5–12 MB; the bucket takes 3 MB. Re-encode in the
 * browser, before anything is sent: scaled to at most `MAX_SIDE` and saved
 * as JPEG. The result also carries the final pixel size the gallery needs.
 */
export async function shrinkImage(file: File): Promise<ShrunkImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Browser tidak bisa memproses gambar.')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Browser tidak bisa memproses gambar.')
  return { blob, width, height, type: 'image/jpeg' }
}

/** The natural size of an image at a URL (for a link pasted by hand). */
export function measureImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('Gambar tidak bisa dimuat dari tautan itu.'))
    image.src = url
  })
}

const browserStorage = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  }).storage

/** Shrink, then upload into `media/<folder>/`. Resolves to the public URL and size. */
export async function uploadPhoto(
  folder: 'galeri' | 'berita' | 'pemenang' | 'tentor',
  file: File,
): Promise<{ url: string; width: number; height: number }> {
  const image = await shrinkImage(file)
  const start = await mulaiUploadGambar(folder, image.type, image.blob.size)
  if (!start.ok) throw new Error(start.error)
  const { error } = await browserStorage()
    .from('media')
    .uploadToSignedUrl(start.path, start.token, image.blob, { contentType: image.type })
  if (error) throw new Error('Upload gagal, coba lagi.')
  return { url: start.publicUrl, width: image.width, height: image.height }
}

/** Upload a clip as-is into the `video` bucket. Resolves to its public URL. */
export async function uploadVideo(file: File): Promise<string> {
  const start = await mulaiUploadVideo(file.type, file.size)
  if (!start.ok) throw new Error(start.error)
  const { error } = await browserStorage()
    .from('video')
    .uploadToSignedUrl(start.path, start.token, file, { contentType: file.type })
  if (error) throw new Error('Upload video gagal, coba lagi.')
  return start.publicUrl
}
