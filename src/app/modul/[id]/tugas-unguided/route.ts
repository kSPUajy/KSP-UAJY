import { notFound, redirect } from 'next/navigation'

import { modulFileName } from '@/components/sections/modul/modul-format'
import { getSessionProfile } from '@/lib/auth/session'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { pad2 } from '@/lib/utils'

/**
 * The only way to a module's unguided task. The file sits in the private
 * `modul-privat` bucket with no storage policies, so nothing opens it but a
 * signed URL from here, and one is handed out only while the admin has the
 * task switched on — or to an admin or tentor, who may preview it while it
 * is locked. The switch is read fresh on every request, never from a cache,
 * so locking it again takes effect at once.
 *
 * The signed URL lives for a minute and carries `download=<name>`, so the
 * browser saves the file under the module's name.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createSupabaseAdmin()
  const { data: row } = await db
    .from('modules')
    .select('minggu, judul, tugas_unguided_path, tugas_unguided_terbuka')
    .eq('id', id)
    .maybeSingle()
  if (!row?.tugas_unguided_path) notFound()

  if (!row.tugas_unguided_terbuka) {
    const profile = await getSessionProfile()
    const staff = profile !== null && !profile.mustChangePassword && (profile.role === 'admin' || profile.role === 'tentor')
    // Anyone else lands back on the module's row, which says the task is locked.
    if (!staff) redirect(`/modul#minggu-${pad2(row.minggu)}`)
  }

  const extension = row.tugas_unguided_path.endsWith('.zip') ? 'zip' : 'pdf'
  const { data, error } = await db.storage
    .from('modul-privat')
    .createSignedUrl(row.tugas_unguided_path, 60, { download: modulFileName(row, 'tugas-unguided', extension) })
  if (error || !data) return new Response('Berkas tugas unguided tidak bisa disiapkan. Coba lagi sebentar lagi.', { status: 503 })

  return new Response(null, { status: 307, headers: { Location: data.signedUrl, 'Cache-Control': 'no-store' } })
}
