'use server'

import { randomUUID } from 'node:crypto'

import { revalidatePath } from 'next/cache'

import { getSessionProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { deadlineToMs } from '@/lib/format'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'
import { MAX_BYTES, checkFile, displayName, effectiveDeadline, kindOf } from '@/lib/tugas/rules'

const BUCKET = 'tugas'

type Failure = { ok: false; error: string }

/**
 * The member and the module, or the reason they may not submit. Every
 * action starts here: nothing a browser sends is trusted on its own.
 */
async function authorise(moduleId: string) {
  const profile = await getSessionProfile()
  if (!profile) return { ok: false, error: 'Sesi berakhir. Masuk lagi, lalu ulangi.' } as const
  if (profile.mustChangePassword) return { ok: false, error: 'Ganti password dulu sebelum mengumpulkan tugas.' } as const

  const modul = (await getModules()).find((item) => item.id === moduleId)
  if (!modul) return { ok: false, error: 'Modul tidak ditemukan.' } as const
  if (modul.status === 'terkunci') return { ok: false, error: 'Modul ini belum dibuka.' } as const

  return { ok: true, profile, modul } as const
}

async function existingSubmission(moduleId: string, userId: string) {
  const { data, error } = await createSupabaseAdmin()
    .from('submissions')
    .select('storage_path, nilai')
    .eq('module_id', moduleId)
    .eq('user_id', userId)
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
  fileName: string,
  size: number,
): Promise<{ ok: true; path: string; token: string } | Failure> {
  const auth = await authorise(moduleId)
  if (!auth.ok) return auth

  const kind = kindOf(fileName)
  if (!kind) return { ok: false, error: 'Hanya berkas .c atau .zip yang diterima.' }
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: 'Berkasnya kosong.' }
  if (size > MAX_BYTES) return { ok: false, error: 'Berkas terlalu besar. Batasnya 5 MB.' }

  const existing = await existingSubmission(moduleId, auth.profile.id)
  if (existing?.nilai != null) return { ok: false, error: 'Tugas ini sudah dinilai, jadi tidak bisa diganti lagi.' }

  const path = `${auth.profile.id}/${moduleId}/${randomUUID()}.${kind}`
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
  path: string,
  fileName: string,
): Promise<{ ok: true; summary: string; terlambat: boolean } | Failure> {
  const auth = await authorise(moduleId)
  if (!auth.ok) return auth

  const prefix = `${auth.profile.id}/${moduleId}/`
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

  const existing = await existingSubmission(moduleId, auth.profile.id)
  if (existing?.nilai != null) {
    await discard()
    return { ok: false, error: 'Tugas ini sudah dinilai, jadi tidak bisa diganti lagi.' }
  }

  const terlambat = Date.now() > deadlineToMs(effectiveDeadline(auth.modul))
  const { error: saveError } = await admin.from('submissions').upsert(
    {
      module_id: moduleId,
      user_id: auth.profile.id,
      storage_path: path,
      file_name: displayName(fileName),
      file_size: bytes.length,
      file_kind: kind,
      submitted_at: new Date().toISOString(),
      terlambat,
    },
    { onConflict: 'module_id,user_id' },
  )
  if (saveError) {
    await discard()
    return { ok: false, error: 'Tugas gagal dicatat. Coba lagi.' }
  }

  // The earlier file is replaced, not kept: one submission per module.
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
