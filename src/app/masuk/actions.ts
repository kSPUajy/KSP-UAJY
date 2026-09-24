'use server'

import { redirect } from 'next/navigation'

import { markPasswordChanged } from '@/lib/auth/accounts'
import { isValidNpm, normaliseNpm, npmToEmail, passwordProblem } from '@/lib/auth/npm'
import { getSessionProfile, safeNext } from '@/lib/auth/session'
import { createSupabaseServer } from '@/lib/supabase/server'

export type FormState =
  | {
      error?: string
      /** Echoed back so a failed attempt does not wipe what was typed. */
      npm?: string
    }
  | undefined

/**
 * Sign in with NPM and password.
 *
 * Every failure that could tell an attacker something — unknown NPM, wrong
 * password — reads the same. Supabase rate-limits password attempts per IP;
 * when it does, the member is told to wait rather than to retype.
 */
export async function masuk(_previous: FormState, formData: FormData): Promise<FormState> {
  const npm = normaliseNpm(String(formData.get('npm') ?? ''))
  const password = String(formData.get('password') ?? '')
  const next = safeNext(formData.get('next'))

  if (!isValidNpm(npm) || password.length === 0) {
    return { error: 'Isi NPM (angka saja) dan password.', npm }
  }

  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.auth.signInWithPassword({ email: npmToEmail(npm), password })

  if (error || !data.user) {
    if (error?.status === 429) return { error: 'Terlalu banyak percobaan. Tunggu beberapa menit, lalu coba lagi.', npm }
    return { error: 'NPM atau password salah.', npm }
  }

  // Signed in, but a sign-in without a profile is not a member.
  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.auth.signOut()
    return { error: 'Akun ini belum terdaftar sebagai anggota. Hubungi pengurus KSP.', npm }
  }

  redirect(profile.must_change_password ? `/masuk/ganti-password?next=${encodeURIComponent(next)}` : next)
}

/**
 * Replace the one-time password with one the member chose. Required before
 * any account page will open; also usable later from the dashboard.
 */
export async function gantiPassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const profile = await getSessionProfile()
  if (!profile) redirect('/masuk')

  const password = String(formData.get('password') ?? '')
  const konfirmasi = String(formData.get('konfirmasi') ?? '')
  const next = safeNext(formData.get('next'))

  const problem = passwordProblem(password, profile.npm)
  if (problem) return { error: problem }
  if (password !== konfirmasi) return { error: 'Konfirmasi password tidak sama.' }

  const supabase = await createSupabaseServer()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (error.code === 'same_password') return { error: 'Password baru harus berbeda dari password sekarang.' }
    if (error.code === 'weak_password') return { error: 'Password ini terlalu lemah atau pernah bocor di internet. Pilih yang lain.' }
    return { error: 'Password gagal diganti. Coba lagi.' }
  }

  await markPasswordChanged(profile.id)
  redirect(next)
}

export async function keluar(): Promise<void> {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  redirect('/')
}
