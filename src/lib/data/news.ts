import 'server-only'

import type { NewsPost } from '@/lib/types'

/**
 * Article metadata. The body is not here — it lives in
 * `src/content/news/<slug>.mdx` and the accessor loads it.
 */
export type NewsSource = Omit<NewsPost, 'bodyMdx'>

const cover = (seed: string): string => `https://picsum.photos/seed/${seed}/1200/675`

export const newsSources: readonly NewsSource[] = [
  {
    id: 'n-01',
    slug: 'pendaftaran-anggota-baru-2026',
    judul: 'Pendaftaran Anggota Baru Semester Ganjil 2026/2027 Dibuka',
    tanggal: '2026-08-24',
    kategori: 'pengumuman',
    cover: cover('ksp-berita-pendaftaran'),
    excerpt:
      'Terbuka untuk mahasiswa aktif UAJY semester 1 sebagai persiapan mata kuliah dasar pemrograman C, tanpa syarat kemampuan awal. Semester lalu sembilan dari dua puluh tujuh anggota baru mendaftar tanpa pengalaman apa pun.',
    penulis: 'Salsabila Rahmawati',
    tags: ['pendaftaran', 'anggota-baru', 'kelas'],
  },
  {
    id: 'n-02',
    slug: 'pemenang-termuda-challenge',
    judul: 'Theresia Menang Dua Minggu Beruntun di Musim Keduanya',
    tanggal: '2026-08-01',
    kategori: 'prestasi',
    cover: cover('ksp-berita-theresia'),
    excerpt:
      'Angkatan 2025, bergabung lewat challenge sebelum mengambil satu kelas pun, dan kini memimpin papan peringkat sepanjang masa dengan sembilan kemenangan.',
    penulis: 'Damar Aji Setiawan',
    tags: ['challenge', 'hall-of-fame', 'anggota'],
  },
  {
    id: 'n-03',
    slug: 'challenge-mingguan-musim-kedua',
    judul: 'Challenge Mingguan Musim Kedua Dimulai Hari Ini',
    tanggal: '2026-07-06',
    kategori: 'pengumuman',
    cover: cover('ksp-berita-challenge'),
    excerpt:
      'Dua belas soal, satu setiap Senin. Tiga perubahan dari musim pertama: tingkat SEGFAULT, petunjuk yang terkunci bertingkat, dan solusi pemenang yang dipublikasikan lengkap dengan tulisan pendekatannya.',
    penulis: 'Nadia Puspita Ramadhani',
    tags: ['challenge', 'pengumuman'],
  },
  {
    id: 'n-04',
    slug: 'peringkat-empat-lomba-se-diy',
    judul: 'Peringkat Empat dari 31 Tim di Lomba Pemrograman Se-DIY',
    tanggal: '2026-05-12',
    kategori: 'prestasi',
    cover: cover('ksp-berita-lomba'),
    excerpt:
      'Delapan dari sebelas soal terselesaikan, terpaut satu soal dari podium. Empat puluh menit hilang di satu soal bitwise, dan tim membawa pulang dua catatan yang langsung masuk materi kelas.',
    penulis: 'Damar Aji Setiawan',
    tags: ['kompetisi', 'prestasi', 'tim'],
  },
  {
    id: 'n-05',
    slug: 'tiga-kesalahan-malloc',
    judul: 'Tiga Kesalahan malloc yang Paling Sering Muncul',
    tanggal: '2026-04-18',
    kategori: 'tutorial',
    cover: cover('ksp-berita-malloc'),
    excerpt:
      'Dikumpulkan dari lebih dari tiga ratus submission dalam dua semester. Ketiganya punya satu kesamaan: programnya tetap jalan, sampai suatu hari tidak.',
    penulis: 'Reza Maulana Hakim',
    tags: ['memori', 'tutorial', 'malloc'],
  },
  {
    id: 'n-06',
    slug: 'bahaya-scanf-persen-s',
    judul: 'Berhenti Menulis scanf Persen-s Tanpa Batas Lebar',
    tanggal: '2026-02-27',
    kategori: 'tutorial',
    cover: cover('ksp-berita-scanf'),
    excerpt:
      'Satu baris yang muncul di hampir setiap submission minggu-minggu awal, dan hampir selalu salah. Perbaikannya cuma satu angka, dan angkanya bukan yang kamu kira.',
    penulis: 'Melati Kusumaningrum',
    tags: ['string', 'tutorial', 'keamanan'],
  },
  {
    id: 'n-07',
    slug: 'kompetisi-internal-akhir-semester',
    judul: 'Kompetisi Internal: 34 Peserta, Satu Soal Tak Tersentuh',
    tanggal: '2025-12-01',
    kategori: 'liputan',
    cover: cover('ksp-berita-kompetisi'),
    excerpt:
      'Tiga jam, delapan soal. Tujuh dari delapan submission untuk soal nomor tujuh sebenarnya sudah benar secara logika, dan yang hilang cuma satu hal.',
    penulis: 'Kevin Alexander Tanuwijaya',
    tags: ['kompetisi', 'liputan', 'graf'],
  },
  {
    id: 'n-08',
    slug: 'workshop-manajemen-memori',
    judul: 'Catatan dari Workshop Manajemen Memori',
    tanggal: '2025-10-27',
    kategori: 'liputan',
    cover: cover('ksp-berita-workshop'),
    excerpt:
      'Dibuka bukan dengan malloc, melainkan dengan menggambar. Dari 28 gambar, hanya 6 yang menempatkan pointer sebagai variabel yang punya alamatnya sendiri.',
    penulis: 'Salsabila Rahmawati',
    tags: ['workshop', 'memori', 'liputan'],
  },
]
