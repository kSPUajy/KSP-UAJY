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

const modul = z.object({
  id: z.string().optional(),
  minggu: z.coerce.number({ error: 'Isi nomor minggu.' }).int('Minggu berupa bilangan bulat.').min(1, 'Minimal minggu 1.').max(52),
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
  berkas_url: z
    .string()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || /^https:\/\//.test(value), 'Tautan harus diawali https://'),
})

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

  const { data: row } = await auth.db.from('modules').select('judul').eq('id', id).maybeSingle()
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

  refresh()
  redirect('/admin/modul')
}

/** A one-time upload URL for a module PDF; the public URL comes back with it. */
export async function mulaiUploadModul(
  fileName: string,
  size: number,
): Promise<{ ok: true; path: string; token: string; publicUrl: string } | { ok: false; error: string }> {
  const auth = await requireAdminAction()
  if (!auth.ok) return { ok: false, error: auth.state?.message ?? 'Tidak diizinkan.' }
  if (!fileName.toLowerCase().endsWith('.pdf')) return { ok: false, error: 'Berkas modul harus PDF.' }
  if (!Number.isFinite(size) || size <= 0 || size > MODULE_FILE_MAX) return { ok: false, error: 'PDF maksimal 20 MB.' }

  const storage = createSupabaseAdmin().storage.from('modul')
  const path = `${randomUUID()}.pdf`
  const { data, error } = await storage.createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: 'Tidak bisa menyiapkan upload.' }
  return { ok: true, path: data.path, token: data.token, publicUrl: storage.getPublicUrl(path).data.publicUrl }
}
