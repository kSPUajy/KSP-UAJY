import { deadlineToMs } from '@/lib/format'
import type { Submission } from '@/lib/tugas/data'
import { effectiveDeadline, isReleased } from '@/lib/tugas/rules'
import type { JenisTugas } from '@/lib/tugas/rules'
import type { ModulWithStatus } from '@/lib/types'

/**
 * Where one member stands on one week's guided task.
 *
 *   terkunci   the module is not out yet (its week may have started: it comes out on Wednesday)
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
  /** The unguided task's hand-in. It has no deadline and no state of its own. */
  unguided: Submission | null
}

export function tugasState(modul: ModulWithStatus, submission: Submission | null, now = Date.now()): TugasState {
  if (modul.status === 'terkunci' || !isReleased(modul, now)) return 'terkunci'
  if (submission?.nilai != null) return 'dinilai'
  if (submission) return submission.terlambat ? 'terlambat' : 'terkumpul'
  return now > deadlineToMs(effectiveDeadline(modul)) ? 'lewat' : 'belum'
}

export function tugasItems(
  modules: readonly ModulWithStatus[],
  submissions: Record<JenisTugas, ReadonlyMap<string, Submission>>,
  now = Date.now(),
): TugasItem[] {
  return modules.map((modul) => {
    const submission = submissions.guided.get(modul.id) ?? null
    const unguided = submissions.unguided.get(modul.id) ?? null
    return { modul, deadline: effectiveDeadline(modul), state: tugasState(modul, submission, now), submission, unguided }
  })
}

/** The task's deadline is still ahead. */
export const beforeDeadline = (item: TugasItem, now = Date.now()): boolean => deadlineToMs(item.deadline) > now

/**
 * The task a member should look at now: the newest released one still
 * before its deadline, then this week's, then the last one out. On a Monday
 * before 19.00, that is still last week's task, due when class starts.
 */
export function focusItem(items: readonly TugasItem[], now = Date.now()): TugasItem | null {
  const released = items.filter((item) => item.state !== 'terkunci')
  const open = [...released].reverse().find((item) => beforeDeadline(item, now))
  return open ?? items.find((item) => item.modul.status === 'berjalan') ?? released[released.length - 1] ?? null
}

export const STATE_LABEL: Record<TugasState, string> = {
  terkunci: 'terkunci',
  belum: 'belum dikumpulkan',
  lewat: 'lewat tenggat',
  terkumpul: 'terkumpul',
  terlambat: 'terlambat',
  dinilai: 'dinilai',
}
