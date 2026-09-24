'use server'

import { randomUUID } from 'node:crypto'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { commaList, failed, fieldErrors, formValues, lines, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { mdxProblem } from '@/lib/admin/mdx'
import { slugify } from '@/lib/format'
import { TAGS } from '@/lib/supabase/public'
import { DIFFICULTIES, TOPIK } from '@/lib/types'

const wall = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Isi tanggal dan jam.')

const challenge = z.object({
  id: z.string().optional(),
  minggu: z.coerce.number({ error: 'Isi nomor minggu.' }).int().min(1, 'Minimal minggu 1.').max(52),
  judul: z.string().min(1, 'Judul wajib diisi.').max(120),
  slug: z.string().optional(),
  tanggal_rilis: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Isi tanggal rilis.'),
  deadline: wall,
  difficulty: z.enum(DIFFICULTIES, { error: 'Pilih tingkat kesulitan.' }),
  total_peserta: z.coerce.number().int().min(0, 'Tidak boleh negatif.').default(0),
  tags: z.string().optional().transform(commaList),
  constraints: z.string().optional().transform(lines),
  hint_terkunci: z.string().optional().transform(lines),
  deskripsi_mdx: z.string().min(1, 'Soal wajib diisi.'),
})

/** Sample I/O arrives as three parallel repeated fields, one entry per example. */
function sampleIO(formData: FormData): { input: string; output: string; penjelasan: string }[] {
  const inputs = formData.getAll('sample_input').map(String)
  const outputs = formData.getAll('sample_output').map(String)
  const notes = formData.getAll('sample_penjelasan').map(String)
  return inputs
    .map((input, index) => ({
      // Trailing whitespace is noise; inner newlines are the data.
      input: input.replace(/\s+$/, ''),
      output: (outputs[index] ?? '').replace(/\s+$/, ''),
      penjelasan: (notes[index] ?? '').trim(),
    }))
    .filter((sample) => sample.input || sample.output)
}

function refresh(): void {
  updateTag(TAGS.challenge)
  revalidatePath('/admin/challenge')
}

export async function simpanChallenge(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = challenge.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  const topik = formData.getAll('topik').map(String).filter((value) => (TOPIK as readonly string[]).includes(value))
  const samples = sampleIO(formData)
  if (samples.length === 0) return failed('Tambahkan minimal satu contoh masukan dan keluaran.', { sample_io: 'Wajib ada.' })
  if (samples.some((sample) => !sample.output)) return failed('Setiap contoh butuh keluaran.', { sample_io: 'Ada keluaran yang kosong.' })

  const { id, slug: rawSlug, ...fields } = parsed.data
  if (fields.deadline.slice(0, 10) < fields.tanggal_rilis) return failed('Deadline harus setelah tanggal rilis.', { deadline: 'Sebelum rilis.' })
  const slug = slugify(rawSlug || fields.judul)
  if (!slug) return failed('Slug tidak bisa dibuat dari judul ini.', { slug: 'Isi slug secara manual.' })

  const problem = await mdxProblem(fields.deskripsi_mdx)
  if (problem) return failed('Soal tidak bisa ditampilkan.', { deskripsi_mdx: problem })

  const creating = !id
  const row = { ...fields, slug, topik, sample_io: samples }
  const { error } = creating
    ? await auth.db.from('challenges').insert({ id: `c-${randomUUID().slice(0, 8)}`, ...row })
    : await auth.db.from('challenges').update(row).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      const onSlug = error.message.includes('slug')
      return failed(onSlug ? 'Slug ini sudah dipakai.' : `Minggu ${fields.minggu} sudah punya challenge.`, onSlug ? { slug: 'Sudah dipakai.' } : { minggu: 'Sudah dipakai.' })
    }
    return failed(`Gagal menyimpan: ${error.message}`)
  }

  refresh()
  if (creating) redirect('/admin/challenge')
  return succeeded('Challenge tersimpan.')
}

export async function hapusChallenge(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const id = String(formData.get('id') ?? '')
  const { data: row } = await auth.db.from('challenges').select('slug').eq('id', id).maybeSingle()
  if (!row) return failed('Challenge tidak ditemukan.')
  if (String(formData.get('konfirmasi') ?? '').trim() !== row.slug) {
    return failed(`Ketik slug "${row.slug}" untuk mengonfirmasi.`, { konfirmasi: 'Slug tidak cocok.' })
  }
  const { error } = await auth.db.from('challenges').delete().eq('id', id)
  if (error) return failed(`Gagal menghapus: ${error.message}`)
  refresh()
  redirect('/admin/challenge')
}

const winner = z.object({
  challenge_id: z.string().min(1),
  nama: z.string().min(1, 'Nama wajib diisi.').max(120),
  slug: z.string().optional(),
  foto: z.string().regex(/^https:\/\//, 'Isi tautan foto (https://…) atau unggah gambar.'),
  angkatan: z.coerce.number({ error: 'Isi angkatan.' }).int().min(2000, 'Angkatan berupa tahun.').max(2100),
  waktu_submit: wall,
  runtime_ms: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || (Number.isInteger(value) && value >= 0), 'Runtime berupa milidetik, bilangan bulat.'),
  total_menang: z.coerce.number({ error: 'Isi total kemenangan.' }).int().min(1, 'Minimal 1.'),
  pendekatan: z.string().min(1, 'Tulis pendekatannya.'),
  kode_solusi: z.string().min(1, 'Tempel kode solusinya.'),
  quote: z.string().min(1, 'Isi kutipan.').max(300),
})

/**
 * One winner per challenge: saving creates it, or replaces the one there.
 * `slug` names the person across every week they win, so it defaults to
 * their name and should be kept the same for repeat winners.
 */
export async function simpanPemenang(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = winner.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  const { data: target } = await auth.db.from('challenges').select('minggu').eq('id', parsed.data.challenge_id).maybeSingle()
  if (!target) return failed('Challenge tidak ditemukan.')

  const { slug: rawSlug, ...fields } = parsed.data
  const slug = slugify(rawSlug || fields.nama)
  const row = { ...fields, slug, minggu: target.minggu, kode_solusi: fields.kode_solusi.replace(/\r\n/g, '\n') }

  const { data: existing } = await auth.db.from('winners').select('id').eq('challenge_id', fields.challenge_id).maybeSingle()
  const { error } = existing
    ? await auth.db.from('winners').update(row).eq('id', existing.id)
    : await auth.db.from('winners').insert({ id: `w-${randomUUID().slice(0, 8)}`, ...row })
  if (error) return failed(`Gagal menyimpan pemenang: ${error.message}`)

  refresh()
  return succeeded('Pemenang tersimpan. Hall of fame ikut diperbarui.')
}

export async function hapusPemenang(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const challengeId = String(formData.get('challenge_id') ?? '')
  const { error } = await auth.db.from('winners').delete().eq('challenge_id', challengeId)
  if (error) return failed(`Gagal menghapus: ${error.message}`)
  refresh()
  return succeeded('Pemenang dihapus.')
}
