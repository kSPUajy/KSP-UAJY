import 'server-only'

import { createSupabaseServer } from '@/lib/supabase/server'
import type { FileKind, JenisTugas } from '@/lib/tugas/rules'

export type Submission = {
  id: string
  moduleId: string
  fileName: string
  fileSize: number
  fileKind: FileKind
  submittedAt: string
  terlambat: boolean
  nilai: number | null
  komentar: string | null
  penilai: string | null
}

/**
 * The signed-in member's own submissions by module, one map per task kind,
 * read under their session: row-level security returns only their rows,
 * whatever this query asks for.
 */
export async function getMySubmissions(userId: string): Promise<Record<JenisTugas, Map<string, Submission>>> {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('submissions')
    .select('id, module_id, jenis, file_name, file_size, file_kind, submitted_at, terlambat, nilai, komentar, penilai')
    .eq('user_id', userId)
  if (error) throw new Error(`Gagal membaca tugas: ${error.message}`)

  const byModule = (jenis: JenisTugas): Map<string, Submission> =>
    new Map(
      data
        .filter((row) => row.jenis === jenis)
        .map((row) => [
          row.module_id,
          {
            id: row.id,
            moduleId: row.module_id,
            fileName: row.file_name,
            fileSize: row.file_size,
            fileKind: row.file_kind as FileKind,
            submittedAt: row.submitted_at,
            terlambat: row.terlambat,
            nilai: row.nilai,
            komentar: row.komentar,
            penilai: row.penilai,
          },
        ]),
    )
  return { guided: byModule('guided'), unguided: byModule('unguided') }
}
