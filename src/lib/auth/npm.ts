/**
 * Members sign in with their NPM. Supabase Auth only knows email addresses,
 * so each NPM maps to a synthetic one under `.invalid` — a TLD reserved by
 * RFC 2606 so that it can never be a real, deliverable address. Nobody ever
 * sees or types it.
 */

const NPM_PATTERN = /^[0-9]{6,15}$/
const EMAIL_DOMAIN = 'anggota.ksp.invalid'

/** Strips the spaces and dots people paste in from KRS printouts. */
export const normaliseNpm = (raw: string): string => raw.replace(/[\s.]/g, '')

export const isValidNpm = (npm: string): boolean => NPM_PATTERN.test(npm)

export const npmToEmail = (npm: string): string => `${npm}@${EMAIL_DOMAIN}`

/** Passwords members choose for themselves. */
export const PASSWORD_MIN_LENGTH = 8

/** The reason a new password is refused, or null when it is fine. */
export function passwordProblem(password: string, npm: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`
  if (password.length > 72) return 'Password maksimal 72 karakter.'
  if (password.includes(npm)) return 'Password tidak boleh memuat NPM-mu.'
  if (/^(.)\1+$/.test(password)) return 'Password tidak boleh satu karakter yang diulang.'
  return null
}
