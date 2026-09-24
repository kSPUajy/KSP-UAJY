'use server'

import { randomUUID } from 'node:crypto'

import { MdxContent } from '@/components/mdx/MdxContent'
import { requireAdminAction } from '@/lib/admin/guard'
import { mdxProblem } from '@/lib/admin/mdx'
import { createSupabaseAdmin } from '@/lib/supabase/admin'

const IMAGE_MAX = 3 * 1024 * 1024
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const
const FOLDERS = ['berita', 'pemenang'] as const

/**
 * Renders MDX exactly as the public pages will — same pipeline, same
 * components — and sends the result back to the editor.
 */
export async function pratinjauMdx(source: string): Promise<React.ReactNode> {
  const auth = await requireAdminAction()
  if (!auth.ok) return <p className="text-sm text-fg">{auth.state?.message}</p>
  const problem = await mdxProblem(source)
  if (problem) {
    return (
      <p className="font-mono text-sm text-fg">
        <span className="text-accent-fg">error:</span> {problem}
      </p>
    )
  }
  return <MdxContent source={source} preview />
}

/** A one-time upload URL into the public `media` bucket; the public URL comes back with it. */
export async function mulaiUploadGambar(
  folder: (typeof FOLDERS)[number],
  contentType: string,
  size: number,
): Promise<{ ok: true; path: string; token: string; publicUrl: string } | { ok: false; error: string }> {
  const auth = await requireAdminAction()
  if (!auth.ok) return { ok: false, error: auth.state?.message ?? 'Tidak diizinkan.' }
  if (!FOLDERS.includes(folder)) return { ok: false, error: 'Tujuan upload tidak dikenal.' }
  const extension = IMAGE_TYPES[contentType as keyof typeof IMAGE_TYPES]
  if (!extension) return { ok: false, error: 'Gambar harus JPG, PNG, atau WebP.' }
  if (!Number.isFinite(size) || size <= 0 || size > IMAGE_MAX) return { ok: false, error: 'Gambar maksimal 3 MB.' }

  const storage = createSupabaseAdmin().storage.from('media')
  const path = `${folder}/${randomUUID()}.${extension}`
  const { data, error } = await storage.createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: 'Tidak bisa menyiapkan upload.' }
  return { ok: true, path: data.path, token: data.token, publicUrl: storage.getPublicUrl(path).data.publicUrl }
}
