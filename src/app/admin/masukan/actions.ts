'use server'

import { revalidatePath } from 'next/cache'

import { requireAdminAction } from '@/lib/admin/guard'

/** Flips a message between read and unread. */
export async function tandaiMasukan(formData: FormData): Promise<void> {
  const auth = await requireAdminAction()
  if (!auth.ok) return
  const id = String(formData.get('id') ?? '')
  const dibaca = formData.get('dibaca') === 'true'
  await auth.db.from('feedback').update({ dibaca }).eq('id', id)
  revalidatePath('/admin/masukan')
  revalidatePath('/admin')
}

export async function hapusMasukan(formData: FormData): Promise<void> {
  const auth = await requireAdminAction()
  if (!auth.ok) return
  await auth.db.from('feedback').delete().eq('id', String(formData.get('id') ?? ''))
  revalidatePath('/admin/masukan')
  revalidatePath('/admin')
}
