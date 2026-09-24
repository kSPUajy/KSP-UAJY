import 'server-only'

import { randomInt } from 'node:crypto'

import { isValidNpm, normaliseNpm, npmToEmail } from '@/lib/auth/npm'
import type { AppRole } from '@/lib/auth/session'
import { createSupabaseAdmin } from '@/lib/supabase/admin'

/**
 * Account administration, with the secret key. Callers check permission
 * first: the admin panel checks the admin's role, and the CLI
 * (`npm run akun`) is only usable by whoever holds `.env.local`.
 */

/** No 0/O, 1/l/I: generated passwords get read out loud and copied by hand. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

/** A one-time password, grouped for reading: `Kp7w-xR3m-Qa9t`. */
export function generatePassword(): string {
  const group = (): string => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  return `${group()}-${group()}-${group()}`
}

export type NewAccount = {
  npm: string
  nama: string
  angkatan?: number | null
  role?: AppRole
  /**
   * A starting password chosen by whoever creates the account, instead of a
   * generated one. It is still one-time: the member must replace it on
   * first sign-in.
   */
  password?: string
}

export type CreatedAccount = {
  id: string
  npm: string
  nama: string
  role: AppRole
  /** Shown once, to whoever created the account. Never stored in the clear. */
  password: string
}

/**
 * Creates the sign-in and the profile together. If the profile cannot be
 * written the sign-in is deleted again, so there is never a half-made
 * account that can sign in but is nobody.
 */
export async function createAccount(input: NewAccount): Promise<CreatedAccount> {
  const npm = normaliseNpm(input.npm)
  const nama = input.nama.trim()
  if (!isValidNpm(npm)) throw new Error(`NPM tidak valid: "${input.npm}" (6–15 digit angka).`)
  if (!nama) throw new Error('Nama wajib diisi.')
  const role = input.role ?? 'anggota'

  if (input.password !== undefined && input.password.length < 8) {
    throw new Error('Password awal minimal 8 karakter.')
  }

  const admin = createSupabaseAdmin()
  const password = input.password ?? generatePassword()

  const { data, error } = await admin.auth.admin.createUser({
    email: npmToEmail(npm),
    password,
    email_confirm: true,
    user_metadata: { npm },
  })
  if (error || !data.user) {
    const taken = error?.message.toLowerCase().includes('already')
    throw new Error(taken ? `NPM ${npm} sudah punya akun.` : `Gagal membuat akun ${npm}: ${error?.message}`)
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: data.user.id,
    npm,
    nama,
    angkatan: input.angkatan ?? null,
    role,
    must_change_password: true,
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id)
    throw new Error(`Gagal menyimpan profil ${npm}: ${profileError.message}`)
  }

  return { id: data.user.id, npm, nama, role, password }
}

/**
 * A fresh one-time password for a member who forgot theirs. They have to
 * replace it again on the next sign-in.
 */
export async function resetPassword(rawNpm: string): Promise<{ npm: string; nama: string; password: string }> {
  const npm = normaliseNpm(rawNpm)
  const admin = createSupabaseAdmin()

  const { data: profile, error } = await admin.from('profiles').select('id, nama').eq('npm', npm).maybeSingle()
  if (error) throw new Error(`Gagal membaca akun ${npm}: ${error.message}`)
  if (!profile) throw new Error(`Tidak ada akun dengan NPM ${npm}.`)

  const password = generatePassword()
  const { error: authError } = await admin.auth.admin.updateUserById(profile.id, { password })
  if (authError) throw new Error(`Gagal mengganti password ${npm}: ${authError.message}`)

  const { error: flagError } = await admin.from('profiles').update({ must_change_password: true }).eq('id', profile.id)
  if (flagError) throw new Error(`Gagal menandai ganti password ${npm}: ${flagError.message}`)

  return { npm, nama: profile.nama, password }
}

/** Clears the first-login flag once the member has chosen their own password. */
export async function markPasswordChanged(userId: string): Promise<void> {
  const admin = createSupabaseAdmin()
  const { error } = await admin.from('profiles').update({ must_change_password: false }).eq('id', userId)
  if (error) throw new Error(`Gagal memperbarui profil: ${error.message}`)
}

export type AccountChanges = {
  nama: string
  angkatan: number | null
  role: AppRole
}

export async function updateAccount(userId: string, changes: AccountChanges): Promise<void> {
  const nama = changes.nama.trim()
  if (!nama) throw new Error('Nama wajib diisi.')
  const { error } = await createSupabaseAdmin()
    .from('profiles')
    .update({ nama, angkatan: changes.angkatan, role: changes.role })
    .eq('id', userId)
  if (error) throw new Error(`Gagal menyimpan: ${error.message}`)
}

/**
 * Deletes the sign-in, and with it (by cascade) the profile and every
 * submission row. The uploaded files are not rows, so they are removed from
 * storage first — otherwise they would outlive the account.
 */
export async function deleteAccount(userId: string): Promise<void> {
  const admin = createSupabaseAdmin()
  const storage = admin.storage.from('tugas')

  const { data: folders } = await storage.list(userId, { limit: 1000 })
  const paths: string[] = []
  for (const folder of folders ?? []) {
    const { data: files } = await storage.list(`${userId}/${folder.name}`, { limit: 1000 })
    for (const file of files ?? []) paths.push(`${userId}/${folder.name}/${file.name}`)
  }
  if (paths.length > 0) {
    const { error } = await storage.remove(paths)
    if (error) throw new Error(`Gagal menghapus berkas tugas: ${error.message}`)
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(`Gagal menghapus akun: ${error.message}`)
}
