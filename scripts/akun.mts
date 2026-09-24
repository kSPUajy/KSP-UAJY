/**
 * Account administration from the command line — for the very first admin,
 * who cannot use the admin panel before they exist, and for emergencies.
 *
 *   npm run akun -- buat  --npm 220711234 --nama "Nama Lengkap" [--peran admin|tentor|anggota] [--angkatan 2022] [--password <awal>]
 *   npm run akun -- reset --npm 220711234
 *
 * Prints a one-time password. The member must replace it on first sign-in.
 * Uses the secret key from `.env.local`, so it only works on a machine that
 * already holds the keys.
 */

import { createAccount, resetPassword } from '../src/lib/auth/accounts'
import type { AppRole } from '../src/lib/auth/session'

const ROLES: readonly AppRole[] = ['anggota', 'tentor', 'admin']

function flag(name: string): string | undefined {
  const args = process.argv.slice(3)
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}

function usage(): never {
  console.error(`Pemakaian:
  npm run akun -- buat  --npm <NPM> --nama "<Nama Lengkap>" [--peran anggota|tentor|admin] [--angkatan <tahun>] [--password <awal>]
  npm run akun -- reset --npm <NPM>`)
  process.exit(1)
}

function printPassword(npm: string, nama: string, password: string): void {
  console.log(`
  nama      : ${nama}
  npm       : ${npm}
  password  : ${password}

  Password ini hanya sekali pakai dan tidak disimpan di mana pun.
  Berikan langsung ke orangnya; ia wajib menggantinya saat pertama masuk di /masuk.
`)
}

const command = process.argv[2]

try {
  if (command === 'buat') {
    const npm = flag('npm')
    const nama = flag('nama')
    const peran = (flag('peran') ?? 'anggota') as AppRole
    const angkatanRaw = flag('angkatan')
    if (!npm || !nama) usage()
    if (!ROLES.includes(peran)) throw new Error(`Peran harus salah satu dari: ${ROLES.join(', ')}.`)
    const angkatan = angkatanRaw ? Number(angkatanRaw) : null
    if (angkatanRaw && !Number.isInteger(angkatan)) throw new Error('Angkatan harus berupa tahun, misalnya 2022.')

    const account = await createAccount({ npm, nama, role: peran, angkatan, password: flag('password') })
    console.log(`\nAkun ${account.role} dibuat.`)
    printPassword(account.npm, account.nama, account.password)
  } else if (command === 'reset') {
    const npm = flag('npm')
    if (!npm) usage()
    const result = await resetPassword(npm)
    console.log('\nPassword direset.')
    printPassword(result.npm, result.nama, result.password)
  } else {
    usage()
  }
} catch (error) {
  console.error(`\nGagal: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
