import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthShell } from '@/components/sections/akun/AuthShell'
import { LoginForm } from '@/components/sections/akun/LoginForm'
import { safeNext } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Masuk',
  description: 'Masuk ke akun anggota Kelompok Studi Pemrograman untuk modul dan tugas guided.',
  path: '/masuk',
  noindex: true,
})

type MasukPageProps = {
  searchParams: Promise<{ next?: string | string[] }>
}

export default async function MasukPage({ searchParams }: MasukPageProps) {
  const { next } = await searchParams
  const target = safeNext(Array.isArray(next) ? next[0] : next)

  return (
    <AuthShell
      title="~/masuk"
      command="ssh anggota@ksp"
      eyebrow="akun anggota"
      heading="Masuk"
      intro="Untuk anggota KSP: modul mingguan, pengumpulan tugas guided, dan nilai dari tentor."
      footer={
        <>
          <p>
            <span className="text-accent-fg">belum punya akun?</span> Akun dibuat pengurus setelah kamu terdaftar
            sebagai anggota.{' '}
            <Link href="/gabung" className="text-fg underline decoration-accent-fg decoration-2 underline-offset-4">
              cara bergabung
            </Link>
          </p>
          <p className="mt-2">
            <span className="text-accent-fg">lupa password?</span> Minta pengurus mereset akunmu — kamu akan diberi
            password sementara.
          </p>
        </>
      }
    >
      <LoginForm next={target} />
    </AuthShell>
  )
}
