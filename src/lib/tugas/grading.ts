import 'server-only'

import type { SessionProfile } from '@/lib/auth/session'
import { getModules } from '@/lib/data'
import { deadlineToMs } from '@/lib/format'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'
import { effectiveDeadline, kindOf } from '@/lib/tugas/rules'
import { readZip } from '@/lib/tugas/unzip'
import type { ZipEntry } from '@/lib/tugas/unzip'
import type { ModulWithStatus } from '@/lib/types'

/**
 * Everything a grader reads is read under their own session, so row-level
 * security (`can_grade`) decides which modules and submissions exist for
 * them. Only file bytes come through the secret key, and only for a
 * submission the session has already been allowed to see.
 */

export type GradableModule = ModulWithStatus & {
  deadline: string
  masuk: number
  dinilai: number
  terlambat: number
}

/** Modules this grader may grade: all of them for an admin, their assigned ones for a tentor. */
export async function getGradableModules(profile: SessionProfile): Promise<GradableModule[]> {
  const db = await createSupabaseServer()
  const [modules, assignments, submissions] = await Promise.all([
    getModules(),
    profile.role === 'admin'
      ? Promise.resolve(null)
      : db.from('module_tentors').select('module_id').eq('profile_id', profile.id),
    db.from('submissions').select('module_id, nilai, terlambat'),
  ])

  const allowed = assignments ? new Set((assignments.data ?? []).map((row) => row.module_id)) : null
  const rows = submissions.data ?? []

  return modules
    .filter((modul) => modul.status !== 'terkunci' && (allowed === null || allowed.has(modul.id)))
    .map((modul) => {
      const mine = rows.filter((row) => row.module_id === modul.id)
      return {
        ...modul,
        deadline: effectiveDeadline(modul),
        masuk: mine.length,
        dinilai: mine.filter((row) => row.nilai !== null).length,
        terlambat: mine.filter((row) => row.terlambat).length,
      }
    })
    .reverse()
}

export type RosterRow = {
  profileId: string
  npm: string
  nama: string
  submission: {
    id: string
    fileName: string
    fileKind: string
    submittedAt: string
    terlambat: boolean
    nilai: number | null
  } | null
}

/** Every member against one module: who handed in, who is late, who has been graded. */
export async function getRoster(moduleId: string): Promise<RosterRow[] | null> {
  const db = await createSupabaseServer()
  const { data: allowed } = await db.rpc('can_grade', { target_module: moduleId })
  if (!allowed) return null

  const [members, submissions] = await Promise.all([
    db.from('profiles').select('id, npm, nama').eq('role', 'anggota'),
    db.from('submissions').select('id, user_id, file_name, file_kind, submitted_at, terlambat, nilai').eq('module_id', moduleId),
  ])
  const byUser = new Map((submissions.data ?? []).map((row) => [row.user_id, row]))

  return (members.data ?? [])
    .map((member) => {
      const row = byUser.get(member.id)
      return {
        profileId: member.id,
        npm: member.npm,
        nama: member.nama,
        submission: row
          ? {
              id: row.id,
              fileName: row.file_name,
              fileKind: row.file_kind,
              submittedAt: row.submitted_at,
              terlambat: row.terlambat,
              nilai: row.nilai,
            }
          : null,
      }
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
}

export type GradingView = {
  id: string
  moduleId: string
  student: { npm: string; nama: string }
  fileName: string
  fileSize: number
  submittedAt: string
  terlambat: boolean
  deadline: string
  nilai: number | null
  komentar: string | null
  penilai: string | null
  content: { kind: 'c'; code: string } | { kind: 'zip'; entries: ZipEntry[] } | { kind: 'missing' }
}

/** One submission, with its code ready to read. Null when this grader may not see it. */
export async function getSubmissionForGrading(submissionId: string): Promise<GradingView | null> {
  const db = await createSupabaseServer()
  const { data: row } = await db
    .from('submissions')
    .select('id, module_id, user_id, storage_path, file_name, file_size, submitted_at, terlambat, nilai, komentar, penilai')
    .eq('id', submissionId)
    .maybeSingle()
  if (!row) return null

  const { data: allowed } = await db.rpc('can_grade', { target_module: row.module_id })
  if (!allowed) return null

  const [{ data: student }, modules, file] = await Promise.all([
    db.from('profiles').select('npm, nama').eq('id', row.user_id).maybeSingle(),
    getModules(),
    createSupabaseAdmin().storage.from('tugas').download(row.storage_path),
  ])
  const modul = modules.find((item) => item.id === row.module_id)

  let content: GradingView['content'] = { kind: 'missing' }
  if (file.data) {
    const bytes = new Uint8Array(await file.data.arrayBuffer())
    content =
      kindOf(row.storage_path) === 'zip'
        ? { kind: 'zip', entries: readZip(bytes) }
        : { kind: 'c', code: new TextDecoder().decode(bytes) }
  }

  return {
    id: row.id,
    moduleId: row.module_id,
    student: { npm: student?.npm ?? '?', nama: student?.nama ?? 'akun terhapus' },
    fileName: row.file_name,
    fileSize: row.file_size,
    submittedAt: row.submitted_at,
    terlambat: row.terlambat,
    deadline: modul ? effectiveDeadline(modul) : '',
    nilai: row.nilai,
    komentar: row.komentar,
    penilai: row.penilai,
    content,
  }
}

/** Is the deadline past? Graders see who is still missing only once it matters. */
export const deadlinePassed = (deadline: string, now = Date.now()): boolean =>
  deadline !== '' && now > deadlineToMs(deadline)
