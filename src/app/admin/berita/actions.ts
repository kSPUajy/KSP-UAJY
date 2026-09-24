'use server'

import { randomUUID } from 'node:crypto'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { commaList, failed, fieldErrors, formValues, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { mdxProblem } from '@/lib/admin/mdx'
import { slugify } from '@/lib/format'
import { TAGS } from '@/lib/supabase/public'
import { KATEGORI_BERITA } from '@/lib/types'

const berita = z.object({
  id: z.string().optional(),
  judul: z.string().min(1, 'Judul wajib diisi.').max(160),
  slug: z.string().optional(),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Isi tanggal.'),
  kategori: z.enum(KATEGORI_BERITA, { error: 'Pilih kategori.' }),
  penulis: z.string().min(1, 'Penulis wajib diisi.').max(80),
  cover: z.string().regex(/^https:\/\//, 'Isi tautan gambar sampul (https://…) atau unggah gambar.'),
  excerpt: z.string().min(20, 'Ringkasan minimal 20 karakter.').max(400, 'Ringkasan maksimal 400 karakter.'),
  tags: z.string().optional().transform(commaList),
  body_mdx: z.string().min(1, 'Isi berita wajib diisi.'),
  published: z.string().optional().transform((value) => value === 'on'),
})

function refresh(): void {
  updateTag(TAGS.berita)
  revalidatePath('/admin/berita')
}

export async function simpanBerita(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = berita.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  const { id, slug: rawSlug, ...fields } = parsed.data
  const slug = slugify(rawSlug || fields.judul)
  if (!slug) return failed('Slug tidak bisa dibuat dari judul ini.', { slug: 'Isi slug secara manual.' })

  const problem = await mdxProblem(fields.body_mdx)
  if (problem) return failed('Isi berita tidak bisa ditampilkan.', { body_mdx: problem })

  const creating = !id
  const row = { ...fields, slug }
  const { error } = creating
    ? await auth.db.from('news_posts').insert({ id: `n-${randomUUID().slice(0, 8)}`, ...row })
    : await auth.db.from('news_posts').update(row).eq('id', id)

  if (error) {
    if (error.code === '23505') return failed('Slug ini sudah dipakai berita lain.', { slug: 'Sudah dipakai.' })
    return failed(`Gagal menyimpan: ${error.message}`)
  }

  refresh()
  if (creating) redirect('/admin/berita')
  return succeeded(fields.published ? 'Tersimpan dan terbit.' : 'Tersimpan sebagai draf.')
}

export async function hapusBerita(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const id = String(formData.get('id') ?? '')
  const { data: row } = await auth.db.from('news_posts').select('slug').eq('id', id).maybeSingle()
  if (!row) return failed('Berita tidak ditemukan.')
  if (String(formData.get('konfirmasi') ?? '').trim() !== row.slug) {
    return failed(`Ketik slug "${row.slug}" untuk mengonfirmasi.`, { konfirmasi: 'Slug tidak cocok.' })
  }
  const { error } = await auth.db.from('news_posts').delete().eq('id', id)
  if (error) return failed(`Gagal menghapus: ${error.message}`)
  refresh()
  redirect('/admin/berita')
}
