'use server'

import { randomUUID } from 'node:crypto'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { failed, fieldErrors, formValues, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { TAGS } from '@/lib/supabase/public'
import { KATEGORI_GALERI } from '@/lib/types'

const size = z.coerce.number().int('Ukuran harus bilangan bulat.').positive('Ukuran gambar belum terbaca.')

const item = z
  .object({
    id: z.string().optional(),
    type: z.enum(['image', 'video']),
    src: z.string().regex(/^https:\/\//, 'Isi tautan gambar (https://…) atau unggah gambar.'),
    video_url: z.string().optional().transform((value) => value || null),
    alt: z.string().min(1, 'Deskripsi gambar wajib diisi (untuk pembaca layar).').max(300),
    caption: z.string().max(300, 'Keterangan maksimal 300 karakter.').optional().transform((value) => value ?? ''),
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Isi tanggal.'),
    kategori: z.enum(KATEGORI_GALERI, { error: 'Pilih kategori.' }),
    width: size,
    height: size,
  })
  .refine((value) => value.type === 'image' || /^https:\/\//.test(value.video_url ?? ''), {
    path: ['video_url'],
    message: 'Video wajib punya tautan (https://…) atau unggah videonya.',
  })

function refresh(): void {
  updateTag(TAGS.galeri)
  revalidatePath('/admin/galeri')
}

const newId = (): string => `g-${randomUUID().slice(0, 8)}`

/** Create or update one item from the full form. */
export async function simpanGaleri(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = item.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  const { id, ...fields } = parsed.data
  const row = { ...fields, video_url: fields.type === 'video' ? fields.video_url : null }
  const { error } = id
    ? await auth.db.from('gallery_items').update(row).eq('id', id)
    : await auth.db.from('gallery_items').insert({ id: newId(), ...row })
  if (error) return failed(`Gagal menyimpan: ${error.message}`)

  refresh()
  if (!id) redirect('/admin/galeri')
  return succeeded('Tersimpan.')
}

const quick = z.object({
  src: z.string().regex(/^https:\/\//),
  width: size,
  height: size,
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Isi tanggal.'),
  kategori: z.enum(KATEGORI_GALERI),
  caption: z.string().max(300).default(''),
})

/**
 * One photo from the bulk uploader, already in the bucket. The alt text
 * starts as a plain description of the event; the list flags it so an
 * admin can write a better one later.
 */
export async function tambahFotoGaleri(input: z.input<typeof quick>): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdminAction()
  if (!auth.ok) return { ok: false, error: auth.state?.message ?? 'Tidak diizinkan.' }
  const parsed = quick.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Data foto tidak lengkap.' }

  const { caption, kategori, ...fields } = parsed.data
  const { error } = await auth.db.from('gallery_items').insert({
    id: newId(),
    ...fields,
    kategori,
    caption,
    alt: caption || `Dokumentasi kegiatan ${kategori} KSP`,
    type: 'image',
  })
  if (error) return { ok: false, error: `Gagal menyimpan: ${error.message}` }
  refresh()
  return { ok: true }
}

/** `…/storage/v1/object/public/<bucket>/<path>` of our own buckets, else null. */
function ownObject(url: string | null): { bucket: string; path: string } | null {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
  if (!url?.startsWith(base)) return null
  const [bucket, ...rest] = url.slice(base.length).split('/')
  if ((bucket !== 'media' && bucket !== 'video') || rest[0] !== 'galeri') return null
  return { bucket, path: rest.join('/') }
}

export async function hapusGaleri(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const id = String(formData.get('id') ?? '')
  if (formData.get('yakin') !== 'on') return failed('Centang konfirmasi dulu.')
  const { data: row } = await auth.db.from('gallery_items').select('src, video_url').eq('id', id).maybeSingle()
  if (!row) return failed('Item galeri tidak ditemukan.')

  const { error } = await auth.db.from('gallery_items').delete().eq('id', id)
  if (error) return failed(`Gagal menghapus: ${error.message}`)

  // The files go too, when they were uploaded here rather than linked.
  const storage = createSupabaseAdmin().storage
  for (const object of [ownObject(row.src), ownObject(row.video_url)]) {
    if (object) await storage.from(object.bucket).remove([object.path])
  }

  refresh()
  redirect('/admin/galeri')
}
