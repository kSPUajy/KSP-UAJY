import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminHeading } from '@/components/admin/AdminHeading'
import { DeleteGaleriForm, GaleriForm } from '@/components/admin/galeri/GaleriForm'
import { TerminalWindow } from '@/components/ui/TerminalWindow'
import { requireProfile } from '@/lib/auth/session'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'

export const metadata: Metadata = pageMetadata({
  title: 'Edit galeri — Admin',
  description: 'Edit item galeri.',
  path: '/admin/galeri',
  noindex: true,
})

export default async function AdminGaleriEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireProfile(`/admin/galeri/${id}`, ['admin'])
  const db = await createSupabaseServer()
  const { data: item } = await db.from('gallery_items').select('*').eq('id', id).maybeSingle()
  if (!item) notFound()

  return (
    <>
      <Link href="/admin/galeri" className="text-xs text-muted hover:text-accent-fg">
        <span aria-hidden className="text-accent-fg">
          &lt;-{' '}
        </span>
        cd ..
      </Link>
      <div className="mt-6">
        <AdminHeading command={`vim ~/galeri/${item.id}`} title={item.caption || 'Item galeri'} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <TerminalWindow title={`~/galeri/${item.id}`} tone="canvas" shadow={false}>
          <GaleriForm
            initial={{
              id: item.id,
              type: item.type === 'video' ? 'video' : 'image',
              src: item.src,
              videoUrl: item.video_url ?? '',
              alt: item.alt,
              caption: item.caption,
              tanggal: item.tanggal,
              kategori: item.kategori,
              width: item.width,
              height: item.height,
            }}
          />
        </TerminalWindow>
        <div className="flex flex-col gap-6">
          <div className="relative border-2 border-line bg-surface-2" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
            <Image src={item.src} alt={item.alt} fill sizes="352px" className="object-cover" />
          </div>
          <TerminalWindow title="~/galeri/rm" tone="canvas" shadow={false}>
            <DeleteGaleriForm id={item.id} />
          </TerminalWindow>
        </div>
      </div>
    </>
  )
}
