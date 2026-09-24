/**
 * The content model.
 *
 * Every field is required unless it is marked optional. The MDX-bearing types
 * carry their body as a plain string rather than a compiled component, so the
 * accessor can swap from the filesystem to a database column later without a
 * single component changing shape.
 */

export const DIFFICULTIES = ['MUDAH', 'SEDANG', 'SULIT', 'SEGFAULT'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const TOPIK = [
  'pointer',
  'array',
  'string',
  'rekursi',
  'struct',
  'linked-list',
  'memori-dinamis',
  'file-io',
  'bitwise',
  'algoritma',
] as const
export type Topik = (typeof TOPIK)[number]

export const DIVISI = ['inti', 'akademik', 'media', 'acara'] as const
export type Divisi = (typeof DIVISI)[number]

export const KATEGORI_BERITA = ['pengumuman', 'liputan', 'tutorial', 'prestasi'] as const
export type KategoriBerita = (typeof KATEGORI_BERITA)[number]

export const KATEGORI_GALERI = ['workshop', 'kelas', 'kompetisi', 'gathering', 'lainnya'] as const
export type KategoriGaleri = (typeof KATEGORI_GALERI)[number]

export type Socials = {
  github?: string
  linkedin?: string
  instagram?: string
}

/** Every portrait is shot to the same frame, so the size lives in one place. */
export const PORTRAIT = { width: 640, height: 800 } as const

/** Article and challenge cover images. */
export const COVER = { width: 1200, height: 675 } as const

// ---------------------------------------------------------------------------

export type Member = {
  id: string
  nama: string
  slug: string
  jabatan: string
  divisi: Divisi
  angkatan: number
  foto: string
  bio: string
  socials: Socials
  /** Absent only for the single root node. */
  parentId?: string
}

/** A member with its subtree attached, built from `parentId` at read time. */
export type MemberNode = Member & {
  children: MemberNode[]
}

export type Pengalaman = {
  tahun: string
  judul: string
  deskripsi: string
}

export type Snippet = {
  judul: string
  code: string
}

export type Tentor = {
  id: string
  nama: string
  slug: string
  foto: string
  keahlian: string[]
  mataKuliahBinaan: string[]
  angkatan: number
  quote: string
  bio: string
  pengalaman: Pengalaman[]
  socials: Socials
  favoriteSnippet: Snippet
}

export type SampleIO = {
  input: string
  output: string
  penjelasan: string
}

export type Challenge = {
  id: string
  slug: string
  minggu: number
  judul: string
  /** ISO date, `YYYY-MM-DD`. */
  tanggalRilis: string
  /** ISO datetime without a zone, read as local campus time. */
  deadline: string
  difficulty: Difficulty
  topik: Topik[]
  /** Raw MDX, loaded from `src/content/challenges/<slug>.mdx`. */
  deskripsiMdx: string
  constraints: string[]
  sampleIO: SampleIO[]
  hintTerkunci: string[]
  /** Points at a `Winner.id`. Absent while the challenge is still open. */
  pemenangId?: string
  totalPeserta: number
  tags: string[]
}

/** What list and filter views get: everything except the MDX body. */
export type ChallengeMeta = Omit<Challenge, 'deskripsiMdx'>

/**
 * One person's win of one challenge.
 *
 * `slug` identifies the person and therefore repeats across their wins;
 * `id` is unique per win. `/hall-of-fame/[slug]` aggregates by `slug`.
 */
export type Winner = {
  id: string
  slug: string
  nama: string
  foto: string
  angkatan: number
  challengeId: string
  minggu: number
  waktuSubmit: string
  runtimeMs?: number
  /** Short write-up of how they got there. */
  pendekatan: string
  /** The submitted C source, verbatim. */
  kodeSolusi: string
  quote: string
  /** All-time win count for this person. */
  totalMenang: number
}

export type WinnerProfile = {
  slug: string
  nama: string
  foto: string
  angkatan: number
  totalMenang: number
  /** Longest run of consecutive weeks won. */
  streak: number
  /** Newest first. */
  wins: Winner[]
}

export type LeaderboardRow = {
  rank: number
  slug: string
  nama: string
  foto: string
  angkatan: number
  totalMenang: number
  streak: number
}

export type NewsPost = {
  id: string
  slug: string
  judul: string
  tanggal: string
  kategori: KategoriBerita
  cover: string
  excerpt: string
  penulis: string
  /** Raw MDX, loaded from `src/content/news/<slug>.mdx`. */
  bodyMdx: string
  tags: string[]
}

export type NewsPostMeta = Omit<NewsPost, 'bodyMdx'>

export type GalleryItem = {
  id: string
  src: string
  alt: string
  caption: string
  tanggal: string
  kategori: KategoriGaleri
  width: number
  height: number
  type: 'image' | 'video'
  /** Required when `type` is `'video'`. */
  videoUrl?: string
}

export type SiteStats = {
  anggota: number
  tentorAktif: number
  challengeTerbit: number
  totalSubmission: number
}

/** One thing a member gets. */
export type Benefit = {
  id: string
  judul: string
  deskripsi: string
}

/**
 * Everything a prospective member needs before deciding. The home page CTA
 * and `/gabung` both read from this one record, so the two can never quote
 * different requirements.
 */
export type JoinInfo = {
  /** One-paragraph pitch. */
  ringkasan: string
  syarat: string[]
  manfaat: Benefit[]
  /** Registration, in order. */
  langkah: JoinStep[]
  faq: Faq[]
}

/**
 * One registration round. Both ends are ISO datetimes without a zone, read
 * as campus time (WIB) — the same convention as challenge deadlines.
 */
export type RegistrationWindow = {
  buka: string
  tutup: string
}

/** `segera`: announced, not yet open. `buka`: taking sign-ups. `tutup`: closed. */
export type RegistrationStatus = 'segera' | 'buka' | 'tutup'

export type Registration = RegistrationWindow & {
  status: RegistrationStatus
}

export type JoinStep = {
  id: string
  judul: string
  deskripsi: string
  /** When it happens, relative to the step before — never a hard date. */
  kapan: string
}

export type Faq = {
  id: string
  pertanyaan: string
  jawaban: string
}

export type Milestone = {
  /** A year or an academic period, printed as-is: `2023`, `2025/2026`. */
  periode: string
  judul: string
  deskripsi: string
}

/** One principle the club runs on. */
export type Prinsip = {
  id: string
  judul: string
  deskripsi: string
}

/** `/tentang`: what the club is, what it holds to, and how it got here. */
export type AboutInfo = {
  /** Opening paragraphs, in order. */
  pembuka: string[]
  prinsip: Prinsip[]
  /** Oldest first. */
  sejarah: Milestone[]
  /** Where and when the club meets. */
  sekretariat: {
    lokasi: string
    jadwalKelas: string
  }
}

/**
 * One week's class module. Everything on `/modul` that changes over the
 * semester — which module is this week's, which are open, which are still
 * locked — is derived from `rilis` and the clock, never stored.
 */
export type Modul = {
  id: string
  minggu: number
  judul: string
  /** ISO date, `YYYY-MM-DD`: the Monday the module is handed out, read as WIB. */
  rilis: string
  /** Tentor responsible for teaching it. Plain names: not every tentor has a profile page. */
  tentorPj: string[]
  koordinator: string
  /** One or two sentences on what the week covers. */
  ringkasan: string
  /** Link to the module file. Absent until it is uploaded; never shown before `rilis`. */
  berkasUrl?: string
  /** Instructions for the week's guided task. Empty when there are none to add. */
  tugasDeskripsi: string
  /** Guided-task deadline, WIB wall clock. Absent means Sunday 23.59 of the module's week. */
  tenggat?: string
}

/** `selesai`: an earlier week. `berjalan`: this week's. `terkunci`: not released yet. */
export type ModulStatus = 'selesai' | 'berjalan' | 'terkunci'

export type ModulWithStatus = Modul & {
  status: ModulStatus
  /** Last day of the module's week, `YYYY-MM-DD` — the day before the next release. */
  sampai: string
}
