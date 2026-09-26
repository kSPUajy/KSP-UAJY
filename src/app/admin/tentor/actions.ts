'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { z } from 'zod'

import { commaList, failed, fieldErrors, formValues, lines, requireAdminAction, succeeded } from '@/lib/admin/guard'
import type { AdminFormState } from '@/lib/admin/guard'
import { TAGS } from '@/lib/supabase/public'

const https = (label: string) =>
  z
    .string()
    .optional()
    .transform((value) => value || '')
    .refine((value) => value === '' || /^https:\/\//.test(value), `${label} harus tautan https://…`)

const profil = z.object({
  profile_id: z.string().uuid('Tentor tidak dikenal.'),
  foto: https('Foto'),
  keahlian: z.string().optional().transform(commaList),
  quote: z.string().max(280, 'Kutipan maksimal 280 karakter.').optional().transform((value) => value ?? ''),
  bio: z.string().max(1500, 'Bio maksimal 1500 karakter.').optional().transform((value) => value ?? ''),
  pengalaman: z.string().optional(),
  snippet_judul: z.string().max(120).optional().transform((value) => value || null),
  snippet_code: z.string().max(8000, 'Snippet maksimal 8000 karakter.').optional().transform((value) => value || null),
  github: https('GitHub'),
  instagram: https('Instagram'),
  linkedin: https('LinkedIn'),
  tampil: z.string().optional().transform((value) => value === 'on'),
})

/** `2025 | Tentor Flowchart | Memegang dua pertemuan…`, one line each. */
function parsePengalaman(value: string | undefined): { rows: Array<{ tahun: string; judul: string; deskripsi: string }>; error?: string } {
  const rows = []
  for (const [index, line] of lines(value).entries()) {
    const [tahun = '', judul = '', ...rest] = line.split('|').map((part) => part.trim())
    if (!judul) return { rows: [], error: `Baris ${index + 1}: tulis "tahun | judul | deskripsi".` }
    rows.push({ tahun, judul, deskripsi: rest.join(' | ') })
  }
  return { rows }
}

export async function simpanProfilTentor(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const auth = await requireAdminAction()
  if (!auth.ok) return auth.state
  const parsed = profil.safeParse(formValues(formData))
  if (!parsed.success) return failed('Periksa isian yang ditandai.', fieldErrors(parsed.error))

  const { github, instagram, linkedin, pengalaman: rawPengalaman, ...fields } = parsed.data
  const pengalaman = parsePengalaman(rawPengalaman)
  if (pengalaman.error) return failed('Periksa isian yang ditandai.', { pengalaman: pengalaman.error })

  const socials = Object.fromEntries(
    Object.entries({ github, instagram, linkedin }).filter(([, href]) => href !== ''),
  )
  const { error } = await auth.db.from('tentor_profiles').upsert({
    ...fields,
    foto: fields.foto || null,
    pengalaman: pengalaman.rows,
    socials,
    updated_at: new Date().toISOString(),
  })
  if (error) return failed(`Gagal menyimpan: ${error.message}`)

  updateTag(TAGS.tentor)
  revalidatePath('/admin/tentor')
  revalidatePath('/admin/anggota')
  return succeeded(fields.tampil ? 'Profil tersimpan.' : 'Profil tersimpan dan disembunyikan dari situs.')
}
