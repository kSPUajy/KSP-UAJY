import 'server-only'

import { readTentorSnippet } from '@/lib/data/content'
import { aboutInfo } from '@/lib/data/tentang'
import { joinInfo } from '@/lib/data/gabung'
import { galleryItems } from '@/lib/data/gallery'
import { members } from '@/lib/data/members'
import { driftTokens, tickerTokens } from '@/lib/data/motifs'
import { statsSource } from '@/lib/data/stats'
import { tentorSources } from '@/lib/data/tentors'
import { addDays, deadlineToMs } from '@/lib/format'
import { TAGS, publicDb } from '@/lib/supabase/public'
import {
  CHALLENGE_META_COLUMNS,
  NEWS_META_COLUMNS,
  toChallenge,
  toChallengeMeta,
  toModul,
  toNewsMeta,
  toNewsPost,
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
  SiteStats,
  Tentor,
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

async function hydrateTentor(source: (typeof tentorSources)[number]): Promise<Tentor> {
  return {
    ...source,
    favoriteSnippet: {
      judul: source.favoriteSnippet.judul,
      code: await readTentorSnippet(source.slug),
    },
  }
}

export async function getTentors(): Promise<Tentor[]> {
  return Promise.all(tentorSources.map(hydrateTentor))
}

export async function getTentorBySlug(slug: string): Promise<Tentor | null> {
  const source = tentorSources.find((tentor) => tentor.slug === slug)
  return source ? hydrateTentor(source) : null
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
  return [...galleryItems].sort((a, b) => b.tanggal.localeCompare(a.tanggal))
}

// ------------------------------------------------------------------ stats ---

export async function getStats(): Promise<SiteStats> {
  const challenges = await getChallenges()
  return {
    anggota: statsSource.anggotaAktif,
    tentorAktif: tentorSources.length,
    challengeTerbit: challenges.length,
    totalSubmission: challenges.reduce((total, challenge) => total + challenge.totalPeserta, 0),
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
 * The semester's modules in week order, each with where it stands right now.
 * A module runs from its release until the next one is released; the last
 * one runs for a week. Pages that show this regenerate hourly.
 */
export async function getModules(now = Date.now()): Promise<ModulWithStatus[]> {
  const { data, error } = await publicDb(TAGS.modul).from('modules').select('*').order('minggu', { ascending: true })
  if (error) throw new Error(`Gagal membaca modul: ${error.message}`)
  const byWeek = data.map(toModul)
  return byWeek.map((modul, index) => {
    const next = byWeek[index + 1]
    const end = next ? next.rilis : addDays(modul.rilis, 7)
    const status: ModulStatus =
      now < startOfDayMs(modul.rilis) ? 'terkunci' : now < startOfDayMs(end) ? 'berjalan' : 'selesai'
    return { ...modul, tentorPj: [...modul.tentorPj], status, sampai: addDays(end, -1) }
  })
}

// ----------------------------------------------------------------- motifs ---

export async function getTickerTokens(): Promise<string[]> {
  return [...tickerTokens]
}

export async function getDriftTokens(): Promise<string[]> {
  return [...driftTokens]
}
