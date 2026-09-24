import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { TentorProfileForm } from '@/components/admin/tentor/TentorProfileForm'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { getTentors } from '@/lib/data'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'
import { snakeCase } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Edit tentor — Admin',
  description: 'Edit profil publik tentor.',
  path: '/admin/tentor',
  noindex: true,
})

export default async function AdminTentorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireProfile(`/admin/tentor/${id}`, ['admin'])
  const tentors = await getTentors({ semua: true })
  const tentor = tentors.find((item) => item.id === id)
  if (!tentor) notFound()

  // The raw row, not the display values: an empty bio must stay empty here,
  // not come back as the generated sentence.
  const db = await createSupabaseServer()
  const { data: row } = await db.from('tentor_profiles').select('*').eq('profile_id', id).maybeSingle()
  const socials = (row?.socials ?? {}) as { github?: string; instagram?: string; linkedin?: string }

  return (
    <>
      <Link href="/admin/tentor" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading
          command={`vim ~/tentor/${snakeCase(tentor.slug)}.c`}
          title={tentor.nama}
          description={
            tentor.modul.length > 0
              ? `Memegang ${tentor.modul.map((modul) => modul.judul).join(', ')}. Pembagian modul diatur di menu modul.`
              : 'Belum ditugaskan ke modul. Pembagian modul diatur di menu modul.'
          }
          actions={
            tentor.tampil ? (
              <Link href={`/tentor/${tentor.slug}`} className="text-xs text-accent-fg underline underline-offset-4">
                lihat profil
              </Link>
            ) : undefined
          }
        />
      </div>
      <TerminalWindow title={`~/tentor/${snakeCase(tentor.slug)}.c`} tone="canvas" shadow={false} className="mt-8">
        <TentorProfileForm
          initial={{
            profileId: tentor.id,
            foto: row?.foto ?? '',
            keahlian: row?.keahlian ?? [],
            quote: row?.quote ?? '',
            bio: row?.bio ?? '',
            pengalaman: tentor.pengalaman,
            snippetJudul: row?.snippet_judul ?? '',
            snippetCode: row?.snippet_code ?? '',
            socials,
            tampil: row?.tampil ?? true,
          }}
        />
      </TerminalWindow>
    </>
  )
}
