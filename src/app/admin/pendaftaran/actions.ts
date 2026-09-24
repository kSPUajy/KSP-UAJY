'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'

import { failed, fieldErrors, formValues, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { toWib } from '@/lib/format'
import { TAGS } from '@/lib/supabase/public'

/** `<input type="datetime-local">` gives `2026-09-24T16:30`, read as WIB. */
const wall = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Isi tanggal dan jam.')

const round = z
  .object({ buka: wall, tutup: wall })
  .refine((value) => value.tutup > value.buka, { message: 'Tutup harus setelah buka.', path: ['tutup'] })

/** Every registration change shows on the home page, /gabung and the nav CTA at once. */
function refresh(): void {
  updateTag(TAGS.pendaftaran)
}

export async function bukaGelombang(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = round.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa tanggalnya.', fieldErrors(parsed.error))

  const { error } = await auth.db.from('registration_rounds').insert(parsed.data)
  if (error) return failed(`Gagal menyimpan: ${error.message}`)
  refresh()
  return succeeded('Gelombang baru dijadwalkan.')
}

const edit = z
  .object({ id: z.coerce.number().int().positive(), buka: wall, tutup: wall })
  .refine((value) => value.tutup > value.buka, { message: 'Tutup harus setelah buka.', path: ['tutup'] })

export async function ubahGelombang(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = edit.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa tanggalnya.', fieldErrors(parsed.error))

  const { id, ...dates } = parsed.data
  const { error } = await auth.db.from('registration_rounds').update(dates).eq('id', id)
  if (error) return failed(`Gagal menyimpan: ${error.message}`)
  refresh()
  return succeeded('Tanggal gelombang diperbarui.')
}

/** Closes the running round this minute, keeping it in the history. */
export async function tutupSekarang(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id)) return failed('Gelombang tidak dikenali.')

  const now = toWib(new Date().toISOString())
  const { data: row } = await auth.db.from('registration_rounds').select('buka').eq('id', id).maybeSingle()
  if (!row) return failed('Gelombang tidak ditemukan.')
  if (row.buka.slice(0, 16) >= now) {
    // Not open yet: closing it now would put `tutup` before `buka`.
    const { error } = await auth.db.from('registration_rounds').delete().eq('id', id)
    if (error) return failed(`Gagal membatalkan: ${error.message}`)
    refresh()
    return succeeded('Gelombang yang belum dibuka dibatalkan.')
  }

  const { error } = await auth.db.from('registration_rounds').update({ tutup: now }).eq('id', id)
  if (error) return failed(`Gagal menutup: ${error.message}`)
  refresh()
  return succeeded('Pendaftaran ditutup sekarang.')
}
