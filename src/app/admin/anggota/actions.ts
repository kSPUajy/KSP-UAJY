'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'

import { failed, fieldErrors, formValues, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { createAccount, deleteAccount, resetPassword, updateAccount } from '@/lib/auth/accounts'
import { isValidNpm, normaliseNpm } from '@/lib/auth/npm'
import { TAGS } from '@/lib/supabase/public'

/** A password handed back exactly once, for the admin to pass on. */
export type IssuedPassword = { npm: string; nama: string; password?: string; error?: string }

const ROLE = z.enum(['anggota', 'tentor', 'admin'], { error: 'Pilih peran.' })

const angkatan = z
  .string()
  .optional()
  .transform((value, context) => {
    if (!value) return null
    const year = Number(value)
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      context.addIssue({ code: 'custom', message: 'Angkatan berupa tahun, misalnya 2024.' })
      return z.NEVER
    }
    return year
  })

const newAccount = z.object({
  npm: z
    .string()
    .transform(normaliseNpm)
    .refine(isValidNpm, 'NPM berupa 6–15 digit angka.'),
  nama: z.string().min(1, 'Nama wajib diisi.').max(120, 'Nama terlalu panjang.'),
  angkatan,
  peran: ROLE,
  password: z
    .string()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => value === undefined || value.length >= 8, 'Password awal minimal 8 karakter, atau kosongkan.'),
})

export async function buatAnggota(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state

  const parsed = newAccount.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  try {
    const account = await createAccount({
      npm: parsed.data.npm,
      nama: parsed.data.nama,
      angkatan: parsed.data.angkatan,
      role: parsed.data.peran,
      password: parsed.data.password,
    })
    revalidatePath('/admin/anggota')
    updateTag(TAGS.anggota)
    const issued: IssuedPassword[] = [{ npm: account.npm, nama: account.nama, password: account.password }]
    return succeeded(`Akun ${account.nama} dibuat.`, issued)
  } catch (error) {
    return failed(error instanceof Error ? error.message : 'Akun gagal dibuat.')
  }
}

/**
 * One member per line: `NPM, Nama, Angkatan` — tab, semicolon or comma
 * separated, so a range copied from a spreadsheet pastes straight in. A
 * header row is skipped. Each line succeeds or fails on its own; the admin
 * gets every password and every error back in one list.
 */
export async function imporAnggota(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state

  const rows = String(formData.get('daftar') ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\t|;|,/).map((cell) => cell.trim()))
    .filter((cells) => /\d/.test(cells[0] ?? '')) // skips a header row

  if (rows.length === 0) return failed('Tempel minimal satu baris: NPM, Nama, Angkatan.')
  if (rows.length > 200) return failed('Maksimal 200 baris sekali impor.')

  const results: IssuedPassword[] = []
  for (const [rawNpm = '', nama = '', rawYear = ''] of rows) {
    const npm = normaliseNpm(rawNpm)
    const year = rawYear ? Number(rawYear) : null
    if (!isValidNpm(npm)) {
      results.push({ npm: rawNpm, nama, error: 'NPM tidak valid' })
      continue
    }
    if (!nama) {
      results.push({ npm, nama, error: 'nama kosong' })
      continue
    }
    try {
      const account = await createAccount({
        npm,
        nama,
        angkatan: year !== null && Number.isInteger(year) ? year : null,
      })
      results.push({ npm, nama: account.nama, password: account.password })
    } catch (error) {
      results.push({ npm, nama, error: error instanceof Error ? error.message : 'gagal' })
    }
  }

  revalidatePath('/admin/anggota')

  updateTag(TAGS.anggota)
  const made = results.filter((row) => row.password).length
  const message = `${made} dari ${results.length} akun dibuat.`
  return made > 0 ? succeeded(message, results) : { ok: false, message, data: results }
}

const idOnly = z.object({ id: z.uuid('Akun tidak dikenali.') })

export async function resetAnggota(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = idOnly.safeParse(formValues(formData))
  if (!parsed.success) return failed('Akun tidak dikenali.')

  const { data: row } = await auth.db.from('profiles').select('npm').eq('id', parsed.data.id).maybeSingle()
  if (!row) return failed('Akun tidak ditemukan.')

  try {
    const result = await resetPassword(row.npm)
    revalidatePath('/admin/anggota')
    updateTag(TAGS.anggota)
    const issued: IssuedPassword[] = [result]
    return succeeded(`Password ${result.nama} direset.`, issued)
  } catch (error) {
    return failed(error instanceof Error ? error.message : 'Reset gagal.')
  }
}

const changes = z.object({
  id: z.uuid('Akun tidak dikenali.'),
  nama: z.string().min(1, 'Nama wajib diisi.').max(120, 'Nama terlalu panjang.'),
  angkatan,
  peran: ROLE,
})

export async function ubahAnggota(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = changes.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  // An admin demoting themselves could leave the club with no admin at all.
  if (parsed.data.id === auth.profile.id && parsed.data.peran !== 'admin') {
    return failed('Kamu tidak bisa menurunkan peranmu sendiri. Minta admin lain melakukannya.')
  }

  try {
    await updateAccount(parsed.data.id, {
      nama: parsed.data.nama,
      angkatan: parsed.data.angkatan,
      role: parsed.data.peran,
    })
    revalidatePath('/admin/anggota')
    updateTag(TAGS.anggota)
    return succeeded('Tersimpan.')
  } catch (error) {
    return failed(error instanceof Error ? error.message : 'Gagal menyimpan.')
  }
}

/** Deleting asks the admin to retype the NPM — a click alone is too easy. */
export async function hapusAnggota(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = idOnly.safeParse(formValues(formData))
  if (!parsed.success) return failed('Akun tidak dikenali.')
  if (parsed.data.id === auth.profile.id) return failed('Kamu tidak bisa menghapus akunmu sendiri.')

  const { data: row } = await auth.db.from('profiles').select('npm, nama').eq('id', parsed.data.id).maybeSingle()
  if (!row) return failed('Akun tidak ditemukan.')
  if (normaliseNpm(String(formData.get('konfirmasi') ?? '')) !== row.npm) {
    return failed(`Ketik NPM ${row.npm} untuk mengonfirmasi.`, { konfirmasi: 'NPM tidak cocok.' })
  }

  try {
    await deleteAccount(parsed.data.id)
    revalidatePath('/admin/anggota')
    updateTag(TAGS.anggota)
    return succeeded(`Akun ${row.nama} dihapus.`)
  } catch (error) {
    return failed(error instanceof Error ? error.message : 'Gagal menghapus.')
  }
}
