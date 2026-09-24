import 'server-only'

import { redirect } from 'next/navigation'
import { cache } from 'react'

import { createSupabaseServer } from '@/lib/supabase/server'

export type AppRole = 'anggota' | 'tentor' | 'admin'

/** What account pages get to know about the visitor — no more. */
export type SessionProfile = {
  id: string
  npm: string
  nama: string
  angkatan: number | null
  role: AppRole
  mustChangePassword: boolean
}

/**
 * The signed-in member, or null.
 *
 * `getClaims()` verifies the access token rather than trusting whatever the
 * cookie says, and the profile is read under the member's own session, so
 * row-level security decides what comes back. An auth user without a
 * profile row is not a member — the result is null, exactly as if nobody
 * were signed in.
 *
 * Memoised per request, so a layout and a page asking at once cost one
 * round trip.
 */
export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const supabase = await createSupabaseServer()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims.sub
  if (!userId) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, npm, nama, angkatan, role, must_change_password')
    .eq('id', userId)
    .maybeSingle()
  if (!profile) return null

  return {
    id: profile.id,
    npm: profile.npm,
    nama: profile.nama,
    angkatan: profile.angkatan,
    role: profile.role,
    mustChangePassword: profile.must_change_password,
  }
})

/** Where a signed-out visitor is sent, remembering where they were going. */
export const signInPath = (next: string): string => `/masuk?next=${encodeURIComponent(next)}`

/**
 * The gate every account page stands behind. Signed out goes to `/masuk`;
 * a first-login password goes to be replaced before anything else; a role
 * that is not allowed goes back to the dashboard.
 */
export async function requireProfile(
  next: string,
  allowed: readonly AppRole[] = ['anggota', 'tentor', 'admin'],
): Promise<SessionProfile> {
  const profile = await getSessionProfile()
  if (!profile) redirect(signInPath(next))
  if (profile.mustChangePassword) redirect('/masuk/ganti-password')
  if (!allowed.includes(profile.role)) redirect('/dashboard')
  return profile
}

/**
 * Only same-site paths are followed after sign-in. `//evil.example` and
 * `/\evil.example` are protocol-relative to a browser, so they are refused
 * along with anything absolute.
 */
export function safeNext(raw: FormDataEntryValue | string | null | undefined, fallback = '/dashboard'): string {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return fallback
  }
  return raw
}
