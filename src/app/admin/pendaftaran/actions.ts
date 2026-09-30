'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'

import { failed, fieldErrors, formValues, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { TAGS } from '@/lib/supabase/public'

/** The home page and /gabung read the switches under this tag. */
function refresh(): void {
  updateTag(TAGS.pendaftaran)
  revalidatePath('/admin/pendaftaran')
}

/**
 * A class's registration switch. It saves the moment it is flipped, on its
 * own, so opening or closing registration is one click.
 */
export async function aturPendaftaran(id: string, buka: boolean): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdminAction()
  if (!auth.ok) return { ok: false, error: auth.state?.message ?? 'Tidak diizinkan.' }
  const { data, error } = await auth.db
    .from('registration_tracks')
    .update({ buka: buka === true })
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return { ok: false, error: `Gagal menyimpan: ${error.message}` }
  if (!data) return { ok: false, error: 'Kelas tidak ditemukan.' }
  refresh()
  return { ok: true }
}

const tautan = z.object({
  id: z.string().min(1, 'Kelas tidak dikenali.'),
  link: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || /^https:\/\/\S+$/.test(value), 'Tautan harus diawali https://, atau kosongkan.'),
})

/** The class's sign-up form. Without one, the class is announced with no "daftar" button. */
export async function simpanTautanPendaftaran(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = tautan.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa tautannya.', fieldErrors(parsed.error))

  const { data, error } = await auth.db
    .from('registration_tracks')
    .update({ link: parsed.data.link })
    .eq('id', parsed.data.id)
    .select('id')
    .maybeSingle()
  if (error) return failed(`Gagal menyimpan: ${error.message}`)
  if (!data) return failed('Kelas tidak ditemukan.')
  refresh()
  return succeeded(parsed.data.link ? 'Tautan tersimpan.' : 'Tautan dihapus: kelas ini diumumkan tanpa tombol daftar.')
}
