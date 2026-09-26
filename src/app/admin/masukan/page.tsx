import type { Metadata } from 'next'

import { hapusMasukan, tandaiMasukan } from '@/app/admin/masukan/actions'
import { AdminHeading } from '@/components/admin/AdminHeading'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { requireProfile } from '@/lib/auth/session'
import { formatTanggalPendek, toWib } from '@/lib/format'
import { pageMetadata } from '@/lib/metadata'
import { createSupabaseServer } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: 'Masukan — Admin',
  description: 'Kritik dan saran dari pengunjung.',
  path: '/admin/masukan',
  noindex: true,
})

export default async function AdminMasukanPage() {
  await requireProfile('/admin/masukan', ['admin'])
  const db = await createSupabaseServer()
  const { data, error } = await db
    .from('feedback')
    .select('id, nama, kategori, pesan, dibaca, created_at')
    .order('dibaca', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Gagal membaca masukan: ${error.message}`)
  const belum = data.filter((row) => !row.dibaca).length

  return (
    <>
      <AdminHeading
        command="tail -f masukan.log"
        title="Kritik & saran"
        description={`Dikirim dari beranda, tanpa login. ${belum} belum dibaca — yang belum dibaca selalu di atas.`}
      />
      {data.length === 0 ? (
        <div className="mt-8">
          <EmptyState command="cat masukan.log" output="0 baris" title="Belum ada masukan" description="Masukan yang dikirim dari beranda akan muncul di sini." />
        </div>
      ) : (
        <ol className="mt-8 border-t-2 border-line">
          {data.map((row) => {
            const waktu = toWib(row.created_at)
            return (
              <li key={row.id} className={cn('border-b-2 border-line px-3 py-4', !row.dibaca && 'bg-surface')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-dim">
                  <Badge size="sm" variant={row.dibaca ? 'ghost' : 'solid'} accent={row.kategori === 'kritik' ? 'orange' : row.kategori === 'saran' ? 'lime' : undefined}>
                    {row.kategori}
                  </Badge>
                  <span className="font-bold text-fg">{row.nama ?? 'anonim'}</span>
                  <span className="tabular-nums">
                    {formatTanggalPendek(waktu)} · {waktu.slice(11)} WIB
                  </span>
                  {!row.dibaca ? <span className="text-accent-fg">● baru</span> : null}
                </div>
                <p className="mt-3 max-w-prose text-sm leading-6 whitespace-pre-line text-fg">{row.pesan}</p>
                <div className="mt-3 flex gap-2">
                  <form action={tandaiMasukan}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="dibaca" value={String(!row.dibaca)} />
                    <button type="submit" className="border-2 border-line-soft px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-line hover:text-fg">
                      {row.dibaca ? 'tandai belum dibaca' : 'tandai sudah dibaca'}
                    </button>
                  </form>
                  <form action={hapusMasukan}>
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" className="border-2 border-line-soft px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-accent-fg hover:text-accent-fg">
                      hapus
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}
