import 'server-only'

import { aboutInfo } from '@/lib/data/tentang'
import { joinInfo } from '@/lib/data/gabung'
import { members } from '@/lib/data/members'
import { driftTokens, tickerTokens } from '@/lib/data/motifs'
import { addDays, deadlineToMs, slugify } from '@/lib/format'
import { pixelPortrait } from '@/lib/pixel-portrait'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { TAGS, publicDb } from '@/lib/supabase/public'
import {
  CHALLENGE_META_COLUMNS,
  NEWS_META_COLUMNS,
  toChallenge,
  toChallengeMeta,
  toGalleryItem,
  toModul,
  toNewsMeta,
  toNewsPost,
  toSesi,
  toWinner,
  wallClock,
} from '@/lib/supabase/rows'
import { buildMemberTree } from '@/lib/tree'
import type {
  AboutInfo,
  Challenge,
  ChallengeMeta,
  GalleryItem,
  JoinInfo,
  LeaderboardRow,
  Member,
  MemberNode,
  ModulStatus,
  ModulWithStatus,
  NewsPost,
  NewsPostMeta,
  Registration,
  RegistrationStatus,
  SesiWithStatus,
  SiteStats,
  Pengalaman,
  Socials,
  Tentor,
  TentorModul,
  TimelineEntry,
  Winner,
  WinnerProfile,
} from '@/lib/types'

/**
 * The only way content reaches a component.
 *
 * Content an admin edits — modules, news, challenges and their winners, the
 * registration round — comes from Supabase through `publicDb`, tagged so an
 * edit refreshes exactly the pages that show it. Content that rarely changes
 * — people, the gallery, the about page — still comes from the files beside
 * this one. Either way, call sites only ever see the types in `@/lib/types`.
 *
 * `server-only` is imported at the top of each data module, so accidentally
 * pulling one of these into a Client Component fails at build time rather than
 * shipping the entire seed set to the browser.
 */

// ---------------------------------------------------------------- members ---

export async function getMembers(): Promise<Member[]> {
  return [...members]
}

export async function getMemberBySlug(slug: string): Promise<Member | null> {
  return members.find((member) => member.slug === slug) ?? null
}

export async function getMemberTree(): Promise<MemberNode[]> {
  return buildMemberTree(members)
}

// ----------------------------------------------------------------- tentor ---

type TentorQuery = {
  /** Include profiles an admin has hidden (the admin panel wants them). */
  semua?: boolean
}

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

function toPengalaman(value: unknown): Pengalaman[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const row = (item ?? {}) as Record<string, unknown>
    const judul = asString(row.judul)
    return judul ? [{ tahun: asString(row.tahun), judul, deskripsi: asString(row.deskripsi) }] : []
  })
}

function toSocials(value: unknown): Socials {
  const row = (value ?? {}) as Record<string, unknown>
  const socials: Socials = {}
  for (const network of ['github', 'linkedin', 'instagram'] as const) {
    const href = asString(row[network])
    if (href.startsWith('https://')) socials[network] = href
  }
  return socials
}

/**
 * Every tentor, straight from the accounts: anyone with the `tentor` role or
 * assigned to a module. Their public extras (photo, bio, …) come from
 * `tentor_profiles` when an admin has filled them in.
 *
 * Profiles are not public, so this reads with the secret key — and returns
 * only what the site shows. Cached under `tentor`, `anggota` and `modul`, so
 * editing a profile, an account or a module assignment refreshes it.
 *
 * Ordered by the first module each tentor holds, so the carousel reads in
 * course order; anyone without a module yet comes last.
 */
export async function getTentors({ semua = false }: TentorQuery = {}): Promise<Tentor[]> {
  const db = createSupabaseAdmin(TAGS.tentor, TAGS.anggota, TAGS.modul)
  const [accounts, assignments, extras, modules] = await Promise.all([
    db.from('profiles').select('id, nama, angkatan, role').neq('role', 'anggota'),
    db.from('module_tentors').select('module_id, profile_id'),
    db.from('tentor_profiles').select('*'),
    getModules(),
  ])
  for (const result of [accounts, assignments, extras]) {
    if (result.error) throw new Error(`Gagal membaca tentor: ${result.error.message}`)
  }

  const moduleById = new Map(modules.map((modul) => [modul.id, modul]))
  const modulesOf = new Map<string, TentorModul[]>()
  for (const row of assignments.data ?? []) {
    const modul = moduleById.get(row.module_id)
    if (!modul) continue
    const list = modulesOf.get(row.profile_id) ?? []
    list.push({ id: modul.id, minggu: modul.minggu, judul: modul.judul })
    modulesOf.set(row.profile_id, list)
  }
  const extraOf = new Map((extras.data ?? []).map((row) => [row.profile_id, row]))

  const usedSlugs = new Set<string>()
  const tentors = (accounts.data ?? [])
    .filter((account) => account.role === 'tentor' || modulesOf.has(account.id))
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
    .map((account): Tentor => {
      const extra = extraOf.get(account.id)
      // Two people with the same name still get distinct URLs.
      const base = slugify(account.nama) || account.id.slice(0, 8)
      let slug = base
      for (let n = 2; usedSlugs.has(slug); n += 1) slug = `${base}-${n}`
      usedSlugs.add(slug)

      const snippetCode = extra?.snippet_code?.trim() ?? ''
      return {
        id: account.id,
        nama: account.nama,
        slug,
        foto: extra?.foto || pixelPortrait(account.nama),
        punyaFoto: Boolean(extra?.foto),
        keahlian: extra?.keahlian ?? [],
        modul: (modulesOf.get(account.id) ?? []).sort((a, b) => a.minggu - b.minggu),
        angkatan: account.angkatan ?? 0,
        quote: extra?.quote ?? '',
        bio: extra?.bio ?? '',
        pengalaman: toPengalaman(extra?.pengalaman),
        socials: toSocials(extra?.socials),
        favoriteSnippet: snippetCode ? { judul: extra?.snippet_judul?.trim() || 'Snippet favorit', code: snippetCode } : null,
        tampil: extra?.tampil ?? true,
      }
    })
    .filter((tentor) => semua || tentor.tampil)

  const firstWeek = (tentor: Tentor): number => tentor.modul[0]?.minggu ?? Number.POSITIVE_INFINITY
  return tentors.sort((a, b) => firstWeek(a) - firstWeek(b) || a.nama.localeCompare(b.nama, 'id'))
}

export async function getTentorBySlug(slug: string): Promise<Tentor | null> {
  const tentors = await getTentors()
  return tentors.find((tentor) => tentor.slug === slug) ?? null
}

// -------------------------------------------------------------- challenge ---

/** Newest week first. */
export async function getChallenges(): Promise<ChallengeMeta[]> {
  const { data, error } = await publicDb(TAGS.challenge)
    .from('challenges')
    .select(CHALLENGE_META_COLUMNS)
    .order('minggu', { ascending: false })
  if (error) throw new Error(`Gagal membaca challenge: ${error.message}`)
  return data.map(toChallengeMeta)
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | null> {
  const { data, error } = await publicDb(TAGS.challenge)
    .from('challenges')
    .select('*, winners(id)')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw new Error(`Gagal membaca challenge ${slug}: ${error.message}`)
  return data ? toChallenge(data) : null
}

export async function getChallengeById(id: string): Promise<ChallengeMeta | null> {
  const challenges = await getChallenges()
  return challenges.find((challenge) => challenge.id === id) ?? null
}

/**
 * The week currently on the clock: the earliest challenge whose deadline has
 * not passed. Falls back to the newest one so the home page always has
 * something to show once the season ends.
 */
export async function getCurrentChallenge(now = Date.now()): Promise<ChallengeMeta | null> {
  const byWeek = [...(await getChallenges())].sort((a, b) => a.minggu - b.minggu)
  const open = byWeek.find((challenge) => deadlineToMs(challenge.deadline) > now)
  if (open) return open
  return byWeek[byWeek.length - 1] ?? null
}

export function isChallengeClosed(challenge: ChallengeMeta, now = Date.now()): boolean {
  return deadlineToMs(challenge.deadline) <= now
}

// ----------------------------------------------------------------- winner ---

/** Week order, oldest first. */
export async function getWinners(): Promise<Winner[]> {
  const { data, error } = await publicDb(TAGS.challenge)
    .from('winners')
    .select('*')
    .order('minggu', { ascending: true })
  if (error) throw new Error(`Gagal membaca pemenang: ${error.message}`)
  return data.map(toWinner)
}

export async function getWinnerById(id: string): Promise<Winner | null> {
  const winners = await getWinners()
  return winners.find((winner) => winner.id === id) ?? null
}

export async function getWinnerByChallengeId(challengeId: string): Promise<Winner | null> {
  const winners = await getWinners()
  return winners.find((winner) => winner.challengeId === challengeId) ?? null
}

/** The most recently decided week's winner. */
export async function getLatestWinner(): Promise<Winner | null> {
  const winners = await getWinners()
  return [...winners].sort((a, b) => b.minggu - a.minggu)[0] ?? null
}

/** Longest run of consecutive weeks won. */
function hitungStreak(wins: readonly Winner[]): number {
  const weeks = [...new Set(wins.map((win) => win.minggu))].sort((a, b) => a - b)

  let terpanjang = 0
  let berjalan = 0
  let sebelumnya: number | null = null

  for (const week of weeks) {
    berjalan = sebelumnya !== null && week === sebelumnya + 1 ? berjalan + 1 : 1
    if (berjalan > terpanjang) terpanjang = berjalan
    sebelumnya = week
  }

  return terpanjang
}

export async function getWinnerProfiles(): Promise<WinnerProfile[]> {
  const winners = await getWinners()
  const bySlug = new Map<string, Winner[]>()

  for (const winner of winners) {
    const bucket = bySlug.get(winner.slug)
    if (bucket) bucket.push(winner)
    else bySlug.set(winner.slug, [winner])
  }

  const profiles: WinnerProfile[] = []
  for (const [slug, wins] of bySlug) {
    const sorted = [...wins].sort((a, b) => b.minggu - a.minggu)
    const terbaru = sorted[0]
    if (!terbaru) continue

    profiles.push({
      slug,
      nama: terbaru.nama,
      foto: terbaru.foto,
      angkatan: terbaru.angkatan,
      totalMenang: terbaru.totalMenang,
      streak: hitungStreak(sorted),
      wins: sorted,
    })
  }

  return profiles
}

export async function getWinnerProfile(slug: string): Promise<WinnerProfile | null> {
  const profiles = await getWinnerProfiles()
  return profiles.find((profile) => profile.slug === slug) ?? null
}

/**
 * All-time standings. Ties are broken by the longer streak, then by whoever got
 * there first — never by name, which would quietly reward the alphabet.
 */
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const profiles = await getWinnerProfiles()

  const urut = [...profiles].sort((a, b) => {
    if (b.totalMenang !== a.totalMenang) return b.totalMenang - a.totalMenang
    if (b.streak !== a.streak) return b.streak - a.streak

    const awalA = a.wins[a.wins.length - 1]?.minggu ?? Number.MAX_SAFE_INTEGER
    const awalB = b.wins[b.wins.length - 1]?.minggu ?? Number.MAX_SAFE_INTEGER
    return awalA - awalB
  })

  return urut.map((profile, index) => ({
    rank: index + 1,
    slug: profile.slug,
    nama: profile.nama,
    foto: profile.foto,
    angkatan: profile.angkatan,
    totalMenang: profile.totalMenang,
    streak: profile.streak,
  }))
}

// ------------------------------------------------------------------- news ---

/** Newest first. Drafts never reach the public client. */
export async function getNewsPosts(): Promise<NewsPostMeta[]> {
  const { data, error } = await publicDb(TAGS.berita)
    .from('news_posts')
    .select(NEWS_META_COLUMNS)
    .order('tanggal', { ascending: false })
  if (error) throw new Error(`Gagal membaca berita: ${error.message}`)
  return data.map(toNewsMeta)
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  const { data, error } = await publicDb(TAGS.berita).from('news_posts').select('*').eq('slug', slug).maybeSingle()
  if (error) throw new Error(`Gagal membaca berita ${slug}: ${error.message}`)
  return data ? toNewsPost(data) : null
}

// ---------------------------------------------------------------- gallery ---

/** Newest first. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await publicDb(TAGS.galeri)
    .from('gallery_items')
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Gagal membaca galeri: ${error.message}`)
  return data.map(toGalleryItem)
}

// ------------------------------------------------------------------ stats ---

/**
 * Live figures from the database, so the strip always agrees with the admin
 * panel: members are `anggota` accounts, tentors are everyone assigned to at
 * least one module (pengurus harian who also teach included), and
 * submissions count both guided tasks and challenge entries.
 *
 * Counts need the secret key (profiles are not public), but only numbers
 * leave this function. Cached under `anggota`/`modul`/`challenge`, and at
 * most an hour stale for new guided submissions.
 */
export async function getStats(): Promise<SiteStats> {
  const db = createSupabaseAdmin(TAGS.anggota, TAGS.modul, TAGS.challenge)
  const [challenges, members, tentors, tugas] = await Promise.all([
    getChallenges(),
    db.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'anggota'),
    db.from('module_tentors').select('profile_id'),
    db.from('submissions').select('id', { count: 'exact', head: true }),
  ])
  for (const result of [members, tentors, tugas]) {
    if (result.error) throw new Error(`Gagal membaca statistik: ${result.error.message}`)
  }

  return {
    anggota: members.count ?? 0,
    tentorAktif: new Set((tentors.data ?? []).map((row) => row.profile_id)).size,
    challengeTerbit: challenges.length,
    totalSubmission: (tugas.count ?? 0) + challenges.reduce((total, challenge) => total + challenge.totalPeserta, 0),
  }
}

// ------------------------------------------------------------------- join ---

export async function getJoinInfo(): Promise<JoinInfo> {
  return {
    ...joinInfo,
    syarat: [...joinInfo.syarat],
    manfaat: joinInfo.manfaat.map((benefit) => ({ ...benefit })),
    langkah: joinInfo.langkah.map((step) => ({ ...step })),
    faq: joinInfo.faq.map((item) => ({ ...item })),
  }
}

/**
 * Where registration stands right now. Pages that show it regenerate hourly,
 * so a round opens or closes on the site within the hour it does on campus.
 */
export async function getRegistration(now = Date.now()): Promise<Registration> {
  const { data, error } = await publicDb(TAGS.pendaftaran)
    .from('registration_rounds')
    .select('buka, tutup')
    .order('buka', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`Gagal membaca pendaftaran: ${error.message}`)
  // No round scheduled yet reads as closed, with nothing to count down to.
  if (!data) return { buka: '', tutup: '', status: 'tutup' }

  const buka = wallClock(data.buka)
  const tutup = wallClock(data.tutup)
  const status: RegistrationStatus =
    now < deadlineToMs(buka) ? 'segera' : now <= deadlineToMs(tutup) ? 'buka' : 'tutup'
  return { buka, tutup, status }
}

// ------------------------------------------------------------------ about ---

export async function getAboutInfo(): Promise<AboutInfo> {
  return {
    pembuka: [...aboutInfo.pembuka],
    prinsip: aboutInfo.prinsip.map((item) => ({ ...item })),
    sejarah: aboutInfo.sejarah.map((item) => ({ ...item })),
    sekretariat: { ...aboutInfo.sekretariat },
  }
}

// ------------------------------------------------------------------ modul ---

/** Midnight WIB at the start of an ISO date. */
const startOfDayMs = (iso: string): number => deadlineToMs(`${iso}T00:00`)

/**
 * The semester's modules in order, each with where it stands right now.
 *
 * A module runs for one week from its release — Monday and Tuesday classes,
 * guided task due that Sunday — or until the next one opens, if that comes
 * sooner. The schedule has long breaks (midterms, holidays, sessions that are
 * not modules), and between modules nothing is "this week's". Pages that show
 * this regenerate hourly.
 */
export async function getModules(now = Date.now()): Promise<ModulWithStatus[]> {
  const { data, error } = await publicDb(TAGS.modul).from('modules').select('*').order('minggu', { ascending: true })
  if (error) throw new Error(`Gagal membaca modul: ${error.message}`)
  const byWeek = data.map(toModul)
  return byWeek.map((modul, index) => {
    const next = byWeek[index + 1]
    // One week, cut short by the next module or by the module's own deadline.
    const cutoffs = [addDays(modul.rilis, 7), next?.rilis, modul.tenggat ? addDays(modul.tenggat.slice(0, 10), 1) : undefined]
    const end = cutoffs.filter((day): day is string => Boolean(day)).sort()[0] ?? addDays(modul.rilis, 7)
    const status: ModulStatus =
      now < startOfDayMs(modul.rilis) ? 'terkunci' : now < startOfDayMs(end) ? 'berjalan' : 'selesai'
    return { ...modul, tentorPj: [...modul.tentorPj], status, sampai: addDays(end, -1) }
  })
}

/** Sessions that are not modules (Games, Review Materi), each running one week from its start. */
export async function getSesi(now = Date.now()): Promise<SesiWithStatus[]> {
  const { data, error } = await publicDb(TAGS.modul).from('sesi').select('*').order('rilis', { ascending: true })
  if (error) throw new Error(`Gagal membaca sesi: ${error.message}`)
  return data.map(toSesi).map((sesi) => {
    const end = addDays(sesi.rilis, 7)
    const status: ModulStatus =
      now < startOfDayMs(sesi.rilis) ? 'terkunci' : now < startOfDayMs(end) ? 'berjalan' : 'selesai'
    return { ...sesi, status, sampai: addDays(end, -1) }
  })
}

/**
 * The whole schedule in date order: modules and the sessions between them.
 * This is what the public timeline shows; tasks and grading use
 * `getModules`, which has modules only.
 */
export async function getTimeline(now = Date.now()): Promise<TimelineEntry[]> {
  const [modules, sesi] = await Promise.all([getModules(now), getSesi(now)])
  const entries: TimelineEntry[] = [
    ...modules.map((modul) => ({ jenis: 'modul' as const, ...modul })),
    ...sesi.map((item) => ({ jenis: 'sesi' as const, ...item })),
  ]
  return entries.sort((a, b) => a.rilis.localeCompare(b.rilis) || (a.jenis === 'modul' ? -1 : 1))
}

// ----------------------------------------------------------------- motifs ---

export async function getTickerTokens(): Promise<string[]> {
  return [...tickerTokens]
}

export async function getDriftTokens(): Promise<string[]> {
  return [...driftTokens]
}
