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

/** Calendar days from one ISO date to another. */
export const selisihHari = (from: string, to: string): number => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)

/** One item of the timeline as an admin reorders it: a module or a session, on the Monday of its week. */
export type SlotJadwal = { jenis: 'modul' | 'sesi'; id: string; judul: string; senin: string }

/**
 * Trades an item's week with its neighbour above (-1) or below (+1): the
 * weeks stay put and the two items swap them. Moving Games up past three
 * modules one step at a time moves each of those modules a week later.
 * Two modules never swap, because their order is the order of the material.
 */
export function tukarSlot<T extends SlotJadwal>(
  items: readonly T[],
  id: string,
  arah: -1 | 1,
): { ok: true; geser: [{ item: T; hari: number }, { item: T; hari: number }] } | { ok: false; error: string } {
  // Same order as getTimeline: by week, a module before a session.
  const urut = [...items].sort((a, b) => a.senin.localeCompare(b.senin) || (a.jenis === b.jenis ? 0 : a.jenis === 'modul' ? -1 : 1))
  const index = urut.findIndex((item) => item.id === id)
  const item = urut[index]
  const tetangga = urut[index + arah]
  if (!item) return { ok: false, error: 'Item ini tidak ada di timeline.' }
  if (!tetangga) return { ok: false, error: `${item.judul} sudah paling ${arah < 0 ? 'atas' : 'bawah'}.` }
  if (item.jenis === 'modul' && tetangga.jenis === 'modul') {
    return { ok: false, error: `${item.judul} dan ${tetangga.judul} sama-sama modul; urutan modul mengikuti nomor minggunya.` }
  }
  const hari = selisihHari(item.senin, tetangga.senin)
  if (hari === 0) return { ok: false, error: `${item.judul} dan ${tetangga.judul} ada di minggu yang sama. Ubah tanggalnya lewat formnya.` }
  return { ok: true, geser: [{ item, hari }, { item: tetangga, hari: -hari }] }
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
