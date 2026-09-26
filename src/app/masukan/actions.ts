'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { failed, fieldErrors, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { KATEGORI_MASUKAN } from '@/lib/types'

const masukan = z.object({
  nama: z
    .string()
    .trim()
    .max(80, 'Nama maksimal 80 karakter.')
    .transform((value) => value || null),
  kategori: z.enum(KATEGORI_MASUKAN, { error: 'Pilih jenis masukan.' }),
  pesan: z
    .string()
    .trim()
    .min(10, 'Tulis minimal 10 karakter, supaya pengurus paham maksudnya.')
    .max(2000, 'Maksimal 2000 karakter.'),
})

/** Past this many in ten minutes, from anyone, the form asks people to wait. */
const BURST_LIMIT = 30

/**
 * A kritik or saran from the home page. Open to anyone, name optional.
 *
 * Written with the secret key because there is deliberately no public
 * insert policy: everything goes through this validation first. `situs` is a
 * honeypot — hidden from people, filled in by bots — and a filled one is
 * thanked and dropped, so a bot learns nothing.
 */
export async function kirimMasukan(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  if (String(formData.get('situs') ?? '') !== '') return succeeded('Terima kasih, masukanmu sudah terkirim.')

  const parsed = masukan.safeParse({
    nama: String(formData.get('nama') ?? ''),
    kategori: String(formData.get('kategori') ?? ''),
    pesan: String(formData.get('pesan') ?? ''),
  })
  if (!parsed.success) return failed('Periksa lagi isiannya.', fieldErrors(parsed.error))

  const db = createSupabaseAdmin()
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await db.from('feedback').select('id', { count: 'exact', head: true }).gte('created_at', since)
  if ((count ?? 0) >= BURST_LIMIT) return failed('Sedang banyak masukan masuk. Coba lagi beberapa menit lagi.')

  const { error } = await db.from('feedback').insert(parsed.data)
  if (error) return failed('Masukan gagal terkirim. Coba lagi sebentar lagi.')

  revalidatePath('/admin/masukan')
  return succeeded('Terima kasih, masukanmu sudah sampai ke pengurus.')
}
