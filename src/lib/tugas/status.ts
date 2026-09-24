import { deadlineToMs } from '@/lib/format'
import type { Submission } from '@/lib/tugas/data'
import { effectiveDeadline } from '@/lib/tugas/rules'
import type { ModulWithStatus } from '@/lib/types'

/**
 * Where one member stands on one week's guided task.
 *
 *   terkunci   the module is not out yet
 *   belum      out, nothing handed in, deadline still ahead
 *   lewat      nothing handed in and the deadline has passed (late is still accepted)
 *   terkumpul  handed in on time, waiting for a grade
 *   terlambat  handed in after the deadline, waiting for a grade
 *   dinilai    graded — locked
 */
export type TugasState = 'terkunci' | 'belum' | 'lewat' | 'terkumpul' | 'terlambat' | 'dinilai'

export type TugasItem = {
  modul: ModulWithStatus
  deadline: string
  state: TugasState
  submission: Submission | null
}

export function tugasState(modul: ModulWithStatus, submission: Submission | null, now = Date.now()): TugasState {
  if (modul.status === 'terkunci') return 'terkunci'
  if (submission?.nilai != null) return 'dinilai'
  if (submission) return submission.terlambat ? 'terlambat' : 'terkumpul'
  return now > deadlineToMs(effectiveDeadline(modul)) ? 'lewat' : 'belum'
}

export function tugasItems(
  modules: readonly ModulWithStatus[],
  submissions: ReadonlyMap<string, Submission>,
  now = Date.now(),
): TugasItem[] {
  return modules.map((modul) => {
    const submission = submissions.get(modul.id) ?? null
    return { modul, deadline: effectiveDeadline(modul), state: tugasState(modul, submission, now), submission }
  })
}

export const STATE_LABEL: Record<TugasState, string> = {
  terkunci: 'terkunci',
  belum: 'belum dikumpulkan',
  lewat: 'lewat tenggat',
  terkumpul: 'terkumpul',
  terlambat: 'terlambat',
  dinilai: 'dinilai',
}
