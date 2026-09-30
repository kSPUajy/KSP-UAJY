import { addDays, deadlineToMs, mondayOf } from '@/lib/format'
import type { Modul, ModulStatus, ModulWithStatus, Sesi, SesiWithStatus } from '@/lib/types'

/**
 * Where each week of the schedule stands at a given moment. Pure, so it can
 * be checked against any date; `getModules` and `getSesi` feed it the rows.
 *
 * A module opens on the Wednesday before its class week (`rilis`, 00.00
 * WIB), so members study it before class. Its class week is the Monday
 * after, Monday and Tuesday classes, and its guided task is due when that
 * class starts, Monday 19.00: handing it in counts towards attendance.
 */

const startOfDayMs = (iso: string): number => deadlineToMs(`${iso}T00:00`)

const earliest = (days: readonly (string | undefined)[]): string | undefined =>
  days.filter((day): day is string => Boolean(day)).sort()[0]

/** The Monday of the class week that follows a release. */
export const classMonday = (rilis: string): string => addDays(mondayOf(rilis), 7)

/**
 * A module is this week's from its release until the next module's release,
 * or until its own class week (or its deadline) is over, whichever is first.
 * The class days always fall inside it. After a class week with nothing
 * released yet (midterms, holidays) nothing is this week's.
 */
export function withModulStatus(modules: readonly Modul[], now: number): ModulWithStatus[] {
  const byWeek = [...modules].sort((a, b) => a.minggu - b.minggu)
  return byWeek.map((modul, index) => {
    const next = byWeek[index + 1]
    const mulai = classMonday(modul.rilis)
    const end =
      earliest([addDays(mulai, 7), next?.rilis, modul.tenggat ? addDays(modul.tenggat.slice(0, 10), 1) : undefined]) ??
      addDays(mulai, 7)
    const status: ModulStatus =
      now < startOfDayMs(modul.rilis) ? 'terkunci' : now < startOfDayMs(end) ? 'berjalan' : 'selesai'
    return {
      ...modul,
      tentorPj: [...modul.tentorPj],
      status,
      mulai,
      sampai: addDays(mulai, 6),
      tenggatBawaan: `${mulai}T19:00`,
    }
  })
}

/**
 * A session (Games, Review Materi) is this week's from its Monday for a
 * week, or until the next module opens during it.
 */
export function withSesiStatus(sesi: readonly Sesi[], moduleReleases: readonly string[], now: number): SesiWithStatus[] {
  const releases = [...moduleReleases].sort()
  return sesi.map((item) => {
    const end = earliest([addDays(item.rilis, 7), releases.find((day) => day > item.rilis)]) ?? addDays(item.rilis, 7)
    const status: ModulStatus =
      now < startOfDayMs(item.rilis) ? 'terkunci' : now < startOfDayMs(end) ? 'berjalan' : 'selesai'
    return { ...item, status, mulai: item.rilis, sampai: addDays(item.rilis, 6) }
  })
}
