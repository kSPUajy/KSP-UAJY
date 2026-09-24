import 'server-only'

import type { Database } from '@/lib/supabase/database.types'
import { KATEGORI_GALERI } from '@/lib/types'
import type {
  Challenge,
  ChallengeMeta,
  Difficulty,
  GalleryItem,
  KategoriBerita,
  KategoriGaleri,
  Modul,
  Sesi,
  NewsPost,
  NewsPostMeta,
  SampleIO,
  Topik,
  Winner,
} from '@/lib/types'

/**
 * Database rows to the app's own types.
 *
 * The components were written against `src/lib/types.ts` long before there
 * was a database, and they stay that way: snake_case and Postgres types stop
 * here. Every mapper is total — a malformed row fails loudly at build time
 * rather than rendering half a page.
 */

type Tables = Database['public']['Tables']
export type ModuleRow = Tables['modules']['Row']
export type NewsRow = Tables['news_posts']['Row']
export type ChallengeRow = Tables['challenges']['Row']
export type WinnerRow = Tables['winners']['Row']
export type SesiRow = Tables['sesi']['Row']

/**
 * A `timestamp without time zone` comes back as `2026-07-12T23:59:00`. The
 * app writes wall-clock WIB times as `2026-07-12T23:59`, and `deadlineToMs`
 * appends the seconds and zone itself — so the seconds go.
 */
export const wallClock = (value: string): string => value.replace(' ', 'T').slice(0, 16)

export function toModul(row: ModuleRow): Modul {
  return {
    id: row.id,
    minggu: row.minggu,
    judul: row.judul,
    rilis: row.rilis,
    tentorPj: row.tentor_pj,
    koordinator: row.koordinator,
    ringkasan: row.ringkasan,
    ...(row.berkas_url ? { berkasUrl: row.berkas_url } : {}),
    tugasDeskripsi: row.tugas_deskripsi,
    ...(row.tenggat ? { tenggat: wallClock(row.tenggat) } : {}),
  }
}

export const NEWS_META_COLUMNS = 'id, slug, judul, tanggal, kategori, cover, excerpt, penulis, tags' as const

export function toNewsMeta(row: Omit<NewsRow, 'body_mdx' | 'published' | 'updated_at'>): NewsPostMeta {
  return {
    id: row.id,
    slug: row.slug,
    judul: row.judul,
    tanggal: row.tanggal,
    kategori: row.kategori as KategoriBerita,
    cover: row.cover,
    excerpt: row.excerpt,
    penulis: row.penulis,
    tags: row.tags,
  }
}

export const toNewsPost = (row: NewsRow): NewsPost => ({ ...toNewsMeta(row), bodyMdx: row.body_mdx })

function toSampleIO(value: unknown): SampleIO[] {
  if (!Array.isArray(value)) throw new Error('challenges.sample_io harus berupa array')
  return value.map((item) => {
    const { input, output, penjelasan } = (item ?? {}) as Record<string, unknown>
    if (typeof input !== 'string' || typeof output !== 'string') {
      throw new Error('Setiap sample_io wajib punya input dan output berupa teks')
    }
    return { input, output, penjelasan: typeof penjelasan === 'string' ? penjelasan : '' }
  })
}

export const CHALLENGE_META_COLUMNS =
  'id, slug, minggu, judul, tanggal_rilis, deadline, difficulty, topik, constraints, sample_io, hint_terkunci, total_peserta, tags, winners(id)' as const

/**
 * The winner is embedded through the one-to-one foreign key. PostgREST hands
 * a one-to-one embed back as an object, but older schemas returned a list;
 * accept either.
 */
type WinnerEmbed = { winners: { id: string } | { id: string }[] | null }

function winnerIdOf(row: WinnerEmbed): string | undefined {
  const embed = row.winners
  if (!embed) return undefined
  return Array.isArray(embed) ? embed[0]?.id : embed.id
}

export function toChallengeMeta(
  row: Omit<ChallengeRow, 'deskripsi_mdx' | 'updated_at'> & WinnerEmbed,
): ChallengeMeta {
  const pemenangId = winnerIdOf(row)
  return {
    id: row.id,
    slug: row.slug,
    minggu: row.minggu,
    judul: row.judul,
    tanggalRilis: row.tanggal_rilis,
    deadline: wallClock(row.deadline),
    difficulty: row.difficulty as Difficulty,
    topik: row.topik as Topik[],
    constraints: row.constraints,
    sampleIO: toSampleIO(row.sample_io),
    hintTerkunci: row.hint_terkunci,
    totalPeserta: row.total_peserta,
    tags: row.tags,
    ...(pemenangId ? { pemenangId } : {}),
  }
}

export const toChallenge = (row: ChallengeRow & WinnerEmbed): Challenge => ({
  ...toChallengeMeta(row),
  deskripsiMdx: row.deskripsi_mdx,
})

export function toWinner(row: WinnerRow): Winner {
  return {
    id: row.id,
    slug: row.slug,
    nama: row.nama,
    foto: row.foto,
    angkatan: row.angkatan,
    challengeId: row.challenge_id,
    minggu: row.minggu,
    waktuSubmit: wallClock(row.waktu_submit),
    ...(row.runtime_ms === null ? {} : { runtimeMs: row.runtime_ms }),
    pendekatan: row.pendekatan,
    kodeSolusi: row.kode_solusi,
    quote: row.quote,
    totalMenang: row.total_menang,
  }
}

export const toSesi = (row: SesiRow): Sesi => ({
  id: row.id,
  judul: row.judul,
  rilis: row.rilis,
  pj: row.pj,
  ringkasan: row.ringkasan,
})

type GalleryRow = Database['public']['Tables']['gallery_items']['Row']

export function toGalleryItem(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    src: row.src,
    alt: row.alt,
    caption: row.caption,
    tanggal: row.tanggal,
    kategori: (KATEGORI_GALERI as readonly string[]).includes(row.kategori) ? (row.kategori as KategoriGaleri) : 'lainnya',
    width: row.width,
    height: row.height,
    type: row.type === 'video' && row.video_url ? 'video' : 'image',
    ...(row.type === 'video' && row.video_url ? { videoUrl: row.video_url } : {}),
  }
}
