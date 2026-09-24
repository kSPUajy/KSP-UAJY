'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { failed, fieldErrors, formValues, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { getSessionProfile } from '@/lib/auth/session'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * The grader and the submission, or why not. The row is looked up under the
 * grader's own session and `can_grade` is asked explicitly, so a tentor can
 * only ever touch the modules assigned to them. The write itself uses the
 * secret key: submissions have no API write policies at all.
 */
async function authoriseGrader(submissionId: string) {
  const profile = await getSessionProfile()
  if (!profile) return { ok: false, state: failed('Sesi berakhir. Masuk lagi.') } as const
  if (profile.mustChangePassword) return { ok: false, state: failed('Ganti password dulu.') } as const
  if (profile.role !== 'tentor' && profile.role !== 'admin') {
    return { ok: false, state: failed('Hanya tentor dan admin yang bisa menilai.') } as const
  }

  const db = await createSupabaseServer()
  const { data: row } = await db.from('submissions').select('module_id, user_id').eq('id', submissionId).maybeSingle()
  if (!row) return { ok: false, state: failed('Tugas tidak ditemukan.') } as const
  if (row.user_id === profile.id) return { ok: false, state: failed('Kamu tidak bisa menilai tugasmu sendiri.') } as const

  const { data: allowed } = await db.rpc('can_grade', { target_module: row.module_id })
  if (!allowed) return { ok: false, state: failed('Modul ini tidak ditugaskan kepadamu.') } as const

  return { ok: true, profile, moduleId: row.module_id } as const
}

function refresh(moduleId: string, submissionId: string): void {
  revalidatePath('/penilaian')
  revalidatePath(`/penilaian/${moduleId}`)
  revalidatePath(`/penilaian/${moduleId}/${submissionId}`)
  revalidatePath('/dashboard')
  revalidatePath('/admin')
}

const grade = z.object({
  id: z.uuid('Tugas tidak dikenali.'),
  nilai: z.coerce
    .number({ error: 'Isi nilai 0–100.' })
    .int('Nilai berupa bilangan bulat.')
    .min(0, 'Nilai minimal 0.')
    .max(100, 'Nilai maksimal 100.'),
  komentar: z.string().max(2000, 'Komentar maksimal 2000 karakter.').default(''),
})

/**
 * Records a grade. Grading locks the submission — the member can no longer
 * replace the file — until a grader reopens it.
 */
export async function nilaiTugas(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = grade.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa nilainya.', fieldErrors(parsed.error))

  const auth = await authoriseGrader(parsed.data.id)
  if (!auth.ok) return auth.state

  const { error } = await createSupabaseAdmin()
    .from('submissions')
    .update({
      nilai: parsed.data.nilai,
      komentar: parsed.data.komentar || null,
      dinilai_oleh: auth.profile.id,
      dinilai_at: new Date().toISOString(),
      penilai: auth.profile.nama,
    })
    .eq('id', parsed.data.id)
  if (error) return failed(`Nilai gagal disimpan: ${error.message}`)

  refresh(auth.moduleId, parsed.data.id)
  return succeeded(`Nilai ${parsed.data.nilai} tersimpan. Anggota langsung melihatnya di dashboard.`)
}

/** Clears the grade so the member can hand in a corrected file. */
export async function bukaKembali(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const id = String(formData.get('id') ?? '')
  const auth = await authoriseGrader(id)
  if (!auth.ok) return auth.state

  const { error } = await createSupabaseAdmin()
    .from('submissions')
    .update({ nilai: null, komentar: null, dinilai_oleh: null, dinilai_at: null, penilai: null })
    .eq('id', id)
  if (error) return failed(`Gagal membuka kembali: ${error.message}`)

  refresh(auth.moduleId, id)
  return succeeded('Tugas dibuka kembali. Anggota bisa mengunggah ulang.')
}
