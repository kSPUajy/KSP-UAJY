/**
 * Formatting helpers.
 *
 * All of these are hand-rolled rather than built on `Intl`, for one reason:
 * they run on the server at build time and again in the browser, and they must
 * produce byte-identical output both times. `Intl` depends on the host's ICU
 * data and `Date` parsing depends on the host's timezone — either one can
 * differ between the build machine and the visitor, which shows up as a
 * hydration mismatch.
 */

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

const MONTHS_ID_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
] as const

const DAYS_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
] as const

type DateParts = { year: number; month: number; day: number; hour: number; minute: number }

/** Reads an ISO string as wall-clock time, with no timezone conversion. */
function parseIso(iso: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(iso)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour ?? '0'),
    minute: Number(minute ?? '0'),
  }
}

/** `2026-03-14` -> `14 Maret 2026` */
export function formatTanggal(iso: string): string {
  const parts = parseIso(iso)
  if (!parts) return iso
  return `${parts.day} ${MONTHS_ID[parts.month - 1] ?? ''} ${parts.year}`
}

/** `2026-03-14` -> `14 Mar 2026` */
export function formatTanggalPendek(iso: string): string {
  const parts = parseIso(iso)
  if (!parts) return iso
  return `${parts.day} ${MONTHS_ID_SHORT[parts.month - 1] ?? ''} ${parts.year}`
}

/** `2026-03-14T19:30` -> `14 Maret 2026, 19.30 WIB` */
export function formatTanggalWaktu(iso: string): string {
  const parts = parseIso(iso)
  if (!parts) return iso
  const time = `${pad(parts.hour)}.${pad(parts.minute)}`
  return `${formatTanggal(iso)}, ${time} WIB`
}

/** Weekday name for an ISO date, computed without constructing a local Date. */
export function namaHari(iso: string): string {
  const parts = parseIso(iso)
  if (!parts) return ''
  const utc = Date.UTC(parts.year, parts.month - 1, parts.day)
  return DAYS_ID[new Date(utc).getUTCDay()] ?? ''
}

/**
 * Challenge deadlines are written as campus local time and must be read that
 * way everywhere. Parsing `2026-09-27T23:59` without a zone would resolve
 * against the host's timezone, which differs between a UTC build machine and a
 * reader in Yogyakarta by seven hours — enough to call an open challenge closed.
 */
export function deadlineToMs(deadline: string): number {
  return Date.parse(`${deadline}:00+07:00`)
}

/**
 * A real instant (`2026-09-24T09:15:02.123Z`, as Postgres `timestamptz`
 * returns it) as a WIB wall-clock string, `2026-09-24T16:15`, ready for the
 * formatters above. WIB has no daylight saving, so a fixed +7 is exact.
 */
export function toWib(instant: string): string {
  return new Date(Date.parse(instant) + 7 * 60 * 60 * 1000).toISOString().slice(0, 16)
}

/** `12400` -> `12,1 KB` */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1).replace('.', ',')} KB`
  return `${(kb / 1024).toFixed(1).replace('.', ',')} MB`
}

/** `2026-09-21` + 6 -> `2026-09-27`, in calendar days, with no timezone involved. */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days)).toISOString().slice(0, 10)
}

/** `12345` -> `12.345`, the Indonesian thousands separator. */
export function formatCount(value: number): string {
  const sign = value < 0 ? '-' : ''
  const digits = Math.abs(Math.trunc(value)).toString()
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

/** Lowercases and strips anything that is not a word character or a dash. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
