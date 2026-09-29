'use server'

import { randomUUID } from 'node:crypto'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { commaList, failed, fieldErrors, formValues, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { TAGS } from '@/lib/supabase/public'

const MODULE_FILE_MAX = 20 * 1024 * 1024

/**
 * Where each of a module's three files is uploaded. The module file and the
 * guided task are public; the unguided task goes to the private bucket and
 * is only reached through `/modul/<id>/tugas-unguided` (see the migration
 * `20260929090000_tugas_berkas.sql`).
 */
const BERKAS = {
  modul: { bucket: 'modul', prefix: '' },
  guided: { bucket: 'modul', prefix: 'guided/' },
  unguided: { bucket: 'modul-privat', prefix: 'unguided/' },
} as const

export type JenisBerkas = keyof typeof BERKAS

const httpsOrEmpty = z
  .string()
  .optional()
  .transform((value) => value || null)
  .refine((value) => value === null || /^https:\/\//.test(value), 'Tautan harus diawali https://')

const modul = z.object({
  id: z.string().optional(),
  minggu: z.coerce.number({ error: 'Isi nomor minggu.' }).int('Minggu berupa bilangan bulat.').min(1, 'Minimal minggu 1.').max(52, 'Maksimal minggu 52.'),
  judul: z.string().min(1, 'Judul wajib diisi.').max(120),
  rilis: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Isi tanggal rilis.'),
  tentor_pj: z.string().optional().transform(commaList),
  koordinator: z.string().max(80).default(''),
  ringkasan: z.string().max(600).default(''),
  tugas_deskripsi: z.string().max(4000).default(''),
  tenggat: z
    .string()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value), 'Isi tanggal dan jam, atau kosongkan.'),
  berkas_url: httpsOrEmpty,
  tugas_guided_url: httpsOrEmpty,
  tugas_unguided_path: z
    .string()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || /^unguided\/[0-9a-f-]{36}\.(pdf|zip)$/.test(value), 'Unggah ulang berkasnya.'),
})

type ModuleFiles = { berkas_url: string | null; tugas_guided_url: string | null; tugas_unguided_path: string | null }

/** Our own stored files a module row points at, by bucket. Links elsewhere are not ours to delete. */
function objectsOf(row: ModuleFiles): { modul: string[]; privat: string[] } {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/modul/`
  const own = (url: string | null): string[] =>
    url?.startsWith(base) ? [decodeURIComponent(url.slice(base.length).split('?')[0] ?? '')] : []
  return {
    modul: [...own(row.berkas_url), ...own(row.tugas_guided_url)],
    privat: row.tugas_unguided_path ? [row.tugas_unguided_path] : [],
  }
}

/**
 * Deletes files that no module points at any more: the one a new upload
 * replaced, or a deleted module's. Checked against every module, so a file
 * two modules share is kept while either still uses it.
 */
async function buangBerkasLama(candidates: { modul: string[]; privat: string[] }): Promise<void> {
  if (candidates.modul.length === 0 && candidates.privat.length === 0) return
  const admin = createSupabaseAdmin()
  const { data, error } = await admin.from('modules').select('berkas_url, tugas_guided_url, tugas_unguided_path')
  if (error || !data) return
  const inUse = data.map(objectsOf)
  const usedModul = new Set(inUse.flatMap((files) => files.modul))
  const usedPrivat = new Set(inUse.flatMap((files) => files.privat))
  const modulGone = candidates.modul.filter((path) => !usedModul.has(path))
  const privatGone = candidates.privat.filter((path) => !usedPrivat.has(path))
  if (modulGone.length > 0) await admin.storage.from('modul').remove(modulGone)
  if (privatGone.length > 0) await admin.storage.from('modul-privat').remove(privatGone)
}

/** Every module edit shows on /modul, the home hero and every dashboard. */
function refresh(): void {
  updateTag(TAGS.modul)
  revalidatePath('/admin/modul')
  revalidatePath('/dashboard')
}

export async function simpanModul(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = modul.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  const { id: existingId, ...fields } = parsed.data
  const creating = !existingId
  const id = existingId ?? `mod-${randomUUID().slice(0, 8)}`

  const { data: before } = creating
    ? { data: null }
    : await auth.db.from('modules').select('berkas_url, tugas_guided_url, tugas_unguided_path').eq('id', id).maybeSingle()

  const { error } = creating
    ? await auth.db.from('modules').insert({ id, ...fields })
    : await auth.db.from('modules').update(fields).eq('id', id)

  if (error) {
    if (error.code === '23505') return failed(`Minggu ${fields.minggu} sudah dipakai modul lain.`, { minggu: 'Sudah dipakai.' })
    return failed(`Gagal menyimpan: ${error.message}`)
  }

  // Graders: replace the module's set with exactly what was ticked.
  if (formData.has('tentor_assign')) {
    const ids = [...new Set(formData.getAll('tentor_ids').map(String))].filter((value) => z.uuid().safeParse(value).success)
    const { error: clearError } = await auth.db.from('module_tentors').delete().eq('module_id', id)
    if (clearError) return failed(`Modul tersimpan, tapi tentor penilai gagal diperbarui: ${clearError.message}`)
    if (ids.length > 0) {
      const { error: assignError } = await auth.db
        .from('module_tentors')
        .insert(ids.map((profileId) => ({ module_id: id, profile_id: profileId })))
      if (assignError) return failed(`Modul tersimpan, tapi tentor penilai gagal diperbarui: ${assignError.message}`)
    }
    revalidatePath('/penilaian')
  }

  if (before) await buangBerkasLama(objectsOf(before))
  refresh()
  if (creating) redirect('/admin/modul')
  return succeeded('Modul tersimpan.')
}

/**
 * Deleting a module takes its guided-task submissions with it (the rows by
 * cascade, the files explicitly). The admin must retype the title.
 */
export async function hapusModul(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const id = String(formData.get('id') ?? '')

  const { data: row } = await auth.db
    .from('modules')
    .select('judul, berkas_url, tugas_guided_url, tugas_unguided_path')
    .eq('id', id)
    .maybeSingle()
  if (!row) return failed('Modul tidak ditemukan.')
  if (String(formData.get('konfirmasi') ?? '').trim() !== row.judul) {
    return failed(`Ketik judul "${row.judul}" persis untuk mengonfirmasi.`, { konfirmasi: 'Judul tidak cocok.' })
  }

  const admin = createSupabaseAdmin()
  const { data: files } = await admin.from('submissions').select('storage_path').eq('module_id', id)
  const paths = (files ?? []).map((file) => file.storage_path)
  if (paths.length > 0) await admin.storage.from('tugas').remove(paths)

  const { error } = await auth.db.from('modules').delete().eq('id', id)
  if (error) return failed(`Gagal menghapus: ${error.message}`)

  await buangBerkasLama(objectsOf(row))
  refresh()
  redirect('/admin/modul')
}

/**
 * A one-time upload URL for one of a module's files, PDF or ZIP. `value` is
 * what the form stores once the upload is done: the public link for the
 * public bucket, the bare object path for the private one.
 */
export async function mulaiUploadModul(
  jenis: JenisBerkas,
  fileName: string,
  size: number,
): Promise<{ ok: true; bucket: string; path: string; token: string; value: string } | { ok: false; error: string }> {
  const auth = await requireAdminAction()
  if (!auth.ok) return { ok: false, error: auth.state?.message ?? 'Tidak diizinkan.' }
  if (!Object.hasOwn(BERKAS, jenis)) return { ok: false, error: 'Jenis berkas tidak dikenal.' }
  const extension = /\.(pdf|zip)$/.exec(fileName.toLowerCase())?.[1]
  if (!extension) return { ok: false, error: 'Berkas harus PDF atau ZIP.' }
  if (!Number.isFinite(size) || size <= 0 || size > MODULE_FILE_MAX) return { ok: false, error: 'Berkas maksimal 20 MB.' }

  const target = BERKAS[jenis]
  const storage = createSupabaseAdmin().storage.from(target.bucket)
  const path = `${target.prefix}${randomUUID()}.${extension}`
  const { data, error } = await storage.createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: 'Tidak bisa menyiapkan upload.' }
  const value = target.bucket === 'modul' ? storage.getPublicUrl(path).data.publicUrl : path
  return { ok: true, bucket: target.bucket, path: data.path, token: data.token, value }
}

/**
 * The unguided task's lock, switched on its own: it takes effect the moment
 * it is flipped, whatever else on the form is still unsaved.
 */
export async function aturTugasUnguided(id: string, terbuka: boolean): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdminAction()
  if (!auth.ok) return { ok: false, error: auth.state?.message ?? 'Tidak diizinkan.' }
  const { data, error } = await auth.db
    .from('modules')
    .update({ tugas_unguided_terbuka: terbuka === true })
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: `Gagal menyimpan: ${error.message}` }
  if (!data) return { ok: false, error: 'Modul tidak ditemukan.' }
  refresh()
  return { ok: true }
}

const sesi = z.object({
  id: z.string().optional(),
  judul: z.string().min(1, 'Judul wajib diisi.').max(120),
  rilis: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Isi tanggal mulai.'),
  pj: z.string().max(80).default(''),
  ringkasan: z.string().max(600).default(''),
})

/** A session on the timeline that is not a module: no file, no task, nothing to grade. */
export async function simpanSesi(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = sesi.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  const { id, ...fields } = parsed.data
  const { error } = id
    ? await auth.db.from('sesi').update(fields).eq('id', id)
    : await auth.db.from('sesi').insert({ id: `sesi-${randomUUID().slice(0, 8)}`, ...fields })
  if (error) return failed(`Gagal menyimpan: ${error.message}`)

  refresh()
  return succeeded(id ? 'Sesi tersimpan.' : 'Sesi ditambahkan ke timeline.')
}

export async function hapusSesi(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const id = String(formData.get('id') ?? '')
  const { error } = await auth.db.from('sesi').delete().eq('id', id)
  if (error) return failed(`Gagal menghapus: ${error.message}`)
  refresh()
  return succeeded('Sesi dihapus dari timeline.')
}
