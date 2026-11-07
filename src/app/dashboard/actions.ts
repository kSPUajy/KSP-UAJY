'use server'

import { randomUUID } from 'node:crypto'

import { revalidatePath } from 'next/cache'

import { getSessionProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { deadlineToMs } from '@/lib/format'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'
import { MAX_BYTES, WRONG_KIND, checkFile, displayName, effectiveDeadline, isJenis, isReleased, kindOf } from '@/lib/tugas/rules'
import type { JenisTugas } from '@/lib/tugas/rules'

const BUCKET = 'tugas'

type Failure = { ok: false; error: string }

/**
 * The member and the module, or the reason they may not submit. Every
 * action starts here: nothing a browser sends is trusted on its own.
 * Handing in is for anggota only; admins, tentors and Kominfo never do.
 * The unguided task is taken only while its switch is on, read fresh like
 * `/modul/<id>/tugas-unguided` does, so closing it takes effect at once.
 */
async function authorise(moduleId: string, jenis: JenisTugas) {
  if (!isJenis(jenis)) return { ok: false, error: 'Jenis tugas tidak dikenali.' } as const
  const profile = await getSessionProfile()
  if (!profile) return { ok: false, error: 'Sesi berakhir. Masuk lagi, lalu ulangi.' } as const
  if (profile.mustChangePassword) return { ok: false, error: 'Ganti password dulu sebelum mengumpulkan tugas.' } as const
  if (profile.role !== 'anggota') return { ok: false, error: 'Pengumpulan tugas hanya untuk akun anggota.' } as const

  const modul = (await getModules()).find((item) => item.id === moduleId)
  if (!modul) return { ok: false, error: 'Modul tidak ditemukan.' } as const
  if (modul.status === 'terkunci' || !isReleased(modul)) return { ok: false, error: 'Modul ini belum dirilis.' } as const

  if (jenis === 'unguided') {
    const { data } = await createSupabaseAdmin()
      .from('modules')
      .select('tugas_unguided_path, tugas_unguided_terbuka')
      .eq('id', moduleId)
      .maybeSingle()
    if (!data?.tugas_unguided_path || !data.tugas_unguided_terbuka) {
      return { ok: false, error: 'Pengumpulan tugas unguided sedang ditutup.' } as const
    }
  }

  return { ok: true, profile, modul } as const
}

/**
 * Where a member's files for one task go. Unguided gets a sibling folder, not
 * a nested one: its paths never pass for guided ones, and `deleteAccount`,
 * which looks one folder deep, still finds them.
 */
const folderOf = (userId: string, moduleId: string, jenis: JenisTugas): string =>
  `${userId}/${moduleId}${jenis === 'unguided' ? '-unguided' : ''}/`

async function existingSubmission(moduleId: string, userId: string, jenis: JenisTugas) {
  const { data, error } = await createSupabaseAdmin()
    .from('submissions')
    .select('storage_path, nilai')
    .eq('module_id', moduleId)
    .eq('user_id', userId)
    .eq('jenis', jenis)
    .maybeSingle()
  if (error) throw new Error(`Gagal membaca tugas: ${error.message}`)
  return data
}

/**
 * Step 1: checks everything that can be checked before any bytes move, then
 * hands out a one-time signed upload URL for a path only this member and
 * module can have. The browser uploads straight to storage with it, so a
 * 5 MB file never has to pass through this server.
 */
export async function mulaiUpload(
  moduleId: string,
  jenis: JenisTugas,
  fileName: string,
  size: number,
): Promise<{ ok: true; path: string; token: string } | Failure> {
  const auth = await authorise(moduleId, jenis)
  if (!auth.ok) return auth

  const kind = kindOf(fileName)
  if (!kind) return { ok: false, error: WRONG_KIND }
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: 'Berkasnya kosong.' }
  if (size > MAX_BYTES) return { ok: false, error: 'Berkas terlalu besar. Batasnya 5 MB.' }

  const existing = await existingSubmission(moduleId, auth.profile.id, jenis)
  if (existing?.nilai != null) return { ok: false, error: 'Tugas ini sudah dinilai, jadi tidak bisa diganti lagi.' }

  const path = `${folderOf(auth.profile.id, moduleId, jenis)}${randomUUID()}.${kind}`
  const { data, error } = await createSupabaseAdmin().storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) return { ok: false, error: 'Tidak bisa menyiapkan upload. Coba lagi.' }
  return { ok: true, path: data.path, token: data.token }
}

/**
 * Step 2: reads back what actually landed in storage and judges that — not
 * what the browser claimed. A bad file is deleted on the spot. A good one
 * becomes the member's submission for the module, replacing any earlier
 * file, stamped late or on time by this server's clock.
 */
export async function selesaiUpload(
  moduleId: string,
  jenis: JenisTugas,
  path: string,
  fileName: string,
): Promise<{ ok: true; summary: string; terlambat: boolean } | Failure> {
  const auth = await authorise(moduleId, jenis)
  if (!auth.ok) return auth

  const prefix = folderOf(auth.profile.id, moduleId, jenis)
  const kind = kindOf(path)
  if (!path.startsWith(prefix) || path.includes('..') || path.slice(prefix.length).includes('/') || !kind) {
    return { ok: false, error: 'Upload tidak dikenali.' }
  }

  const admin = createSupabaseAdmin()
  const storage = admin.storage.from(BUCKET)
  const discard = async (): Promise<void> => {
    await storage.remove([path])
  }

  const { data: blob, error: downloadError } = await storage.download(path)
  if (downloadError || !blob) return { ok: false, error: 'Berkas tidak sampai. Coba unggah lagi.' }

  const bytes = new Uint8Array(await blob.arrayBuffer())
  const verdict = checkFile(kind, bytes)
  if (!verdict.ok) {
    await discard()
    return verdict
  }

  const existing = await existingSubmission(moduleId, auth.profile.id, jenis)
  if (existing?.nilai != null) {
    await discard()
    return { ok: false, error: 'Tugas ini sudah dinilai, jadi tidak bisa diganti lagi.' }
  }

  // Unguided has no deadline: it closes when the switch goes off.
  const terlambat = jenis === 'guided' && Date.now() > deadlineToMs(effectiveDeadline(auth.modul))
  const { error: saveError } = await admin.from('submissions').upsert(
    {
      module_id: moduleId,
      user_id: auth.profile.id,
      jenis,
      storage_path: path,
      file_name: displayName(fileName),
      file_size: bytes.length,
      file_kind: kind,
      submitted_at: new Date().toISOString(),
      terlambat,
    },
    { onConflict: 'module_id,user_id,jenis' },
  )
  if (saveError) {
    await discard()
    return { ok: false, error: 'Tugas gagal dicatat. Coba lagi.' }
  }

  // The earlier file is replaced, not kept: one submission per task.
  if (existing && existing.storage_path !== path) await storage.remove([existing.storage_path])

  revalidatePath('/dashboard')
  return { ok: true, summary: verdict.summary, terlambat }
}

/**
 * A 60-second download link for a submission the caller may see. The row is
 * looked up under the caller's own session, so row-level security — not this
 * function — decides whose file it is.
 */
export async function unduhTugas(submissionId: string): Promise<{ ok: true; url: string } | Failure> {
  const profile = await getSessionProfile()
  if (!profile) return { ok: false, error: 'Sesi berakhir. Masuk lagi.' }

  const supabase = await createSupabaseServer()
  const { data: row } = await supabase
    .from('submissions')
    .select('storage_path, file_name')
    .eq('id', submissionId)
    .maybeSingle()
  if (!row) return { ok: false, error: 'Berkas tidak ditemukan.' }

  const { data, error } = await createSupabaseAdmin()
    .storage.from(BUCKET)
    .createSignedUrl(row.storage_path, 60, { download: row.file_name })
  if (error || !data) return { ok: false, error: 'Tautan unduhan gagal dibuat.' }
  return { ok: true, url: data.signedUrl }
}
