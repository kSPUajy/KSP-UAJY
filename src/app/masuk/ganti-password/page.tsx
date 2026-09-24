import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AuthShell } from '@/components/sections/akun/AuthShell'
import { ChangePasswordForm } from '@/components/sections/akun/ChangePasswordForm'
import { getSessionProfile, safeNext, signInPath } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Ganti password',
  description: 'Ganti password akun anggota Kelompok Studi Pemrograman.',
  path: '/masuk/ganti-password',
  noindex: true,
})

type GantiPasswordPageProps = {
  searchParams: Promise<{ next?: string | string[] }>
}

/**
 * Reached two ways: forced, straight after a first sign-in with the
 * password an admin generated; or by choice, from the dashboard.
 */
export default async function GantiPasswordPage({ searchParams }: GantiPasswordPageProps) {
  const profile = await getSessionProfile()
  if (!profile) redirect(signInPath('/masuk/ganti-password'))

  const { next } = await searchParams
  const target = safeNext(Array.isArray(next) ? next[0] : next)
  const forced = profile.mustChangePassword

  return (
    <AuthShell
      title="~/masuk/passwd"
      command={`passwd ${profile.npm}`}
      eyebrow={forced ? 'login pertama' : 'akun'}
      heading="Ganti password"
      intro={
        forced ? (
          <>
            Halo, <span className="text-fg">{profile.nama}</span>. Password yang kamu pakai tadi dibuat pengurus dan
            hanya untuk sekali masuk. Ganti dengan password pilihanmu sendiri sebelum lanjut.
          </>
        ) : (
          'Password baru langsung berlaku. Sesi di perangkat lain tetap masuk sampai kamu keluar di sana.'
        )
      }
    >
      <ChangePasswordForm next={target} />
    </AuthShell>
  )
}
