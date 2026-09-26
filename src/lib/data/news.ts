import 'server-only'

import type { NewsPost } from '@/lib/types'

/**
 * Article metadata. The body is not here — it lives in
 * `src/content/news/<slug>.mdx` and the accessor loads it.
 *
 * Apart from the registration notice, these are articles about C itself —
 * facts and beginner tips — rather than reports of events, so nothing here
 * describes something that did not happen. Signed "Tim KSP", not a person.
 */
export type NewsSource = Omit<NewsPost, 'bodyMdx'>

const cover = (seed: string): string => `https://picsum.photos/seed/${seed}/1200/675`

const TIM = 'Tim KSP'

export const newsSources: readonly NewsSource[] = [
  {
    id: 'n-14',
    slug: 'kebiasaan-kecil-kode-c-rapi',
    judul: 'Lima Kebiasaan Kecil Supaya Kode C Lebih Rapi',
    tanggal: '2026-09-24',
    kategori: 'tips',
    cover: cover('ksp-artikel-rapi'),
    excerpt:
      'Kode yang rapi lebih mudah dibaca, lebih mudah diperiksa, dan lebih mudah kamu perbaiki sendiri. Lima kebiasaan kecil yang dampaknya besar.',
    penulis: TIM,
    tags: ['tips', 'pemula', 'gaya-kode'],
  },
  {
    id: 'n-13',
    slug: 'debugging-pakai-printf',
    judul: 'Debugging Pakai printf: Cara Paling Sederhana Menemukan Bug',
    tanggal: '2026-09-20',
    kategori: 'tips',
    cover: cover('ksp-artikel-debug'),
    excerpt:
      'Programnya jalan tapi hasilnya salah, dan tidak ada pesan error. Cetak isi variabelnya, dan lihat sendiri apa yang sebenarnya terjadi.',
    penulis: TIM,
    tags: ['tips', 'debugging', 'printf'],
  },
  {
    id: 'n-12',
    slug: 'trik-printf-yang-jarang-diketahui',
    judul: 'Trik printf yang Jarang Diketahui',
    tanggal: '2026-09-16',
    kategori: 'tips',
    cover: cover('ksp-artikel-printf'),
    excerpt:
      'Mengatur lebar kolom, mengisi dengan nol, mencetak tanda persen, sampai fakta bahwa printf ternyata mengembalikan nilai.',
    penulis: TIM,
    tags: ['tips', 'printf', 'format'],
  },
  {
    id: 'n-11',
    slug: 'membaca-pesan-error-compiler',
    judul: 'Membaca Pesan Error Compiler Tanpa Panik',
    tanggal: '2026-09-12',
    kategori: 'tips',
    cover: cover('ksp-artikel-error'),
    excerpt:
      'Pesan error itu teman: compiler memberi tahu letak masalahnya. Begini cara membacanya di Dev-C++, termasuk error for loop yang sering bikin bingung.',
    penulis: TIM,
    tags: ['tips', 'compiler', 'pemula'],
  },
  {
    id: 'n-10',
    slug: 'fakta-unik-bahasa-c',
    judul: 'Tujuh Fakta Unik tentang Bahasa C',
    tanggal: '2026-09-08',
    kategori: 'fakta',
    cover: cover('ksp-artikel-fakta'),
    excerpt:
      'Dari asal-usul namanya, program "Hello, world!" pertama, sampai keunikan kecil yang bikin programmer berpengalaman pun kaget.',
    penulis: TIM,
    tags: ['fakta', 'sejarah', 'bahasa-c'],
  },
  {
    id: 'n-09',
    slug: 'kenapa-bahasa-c-masih-dipakai',
    judul: 'Kenapa Bahasa C Masih Dipakai Sampai Sekarang',
    tanggal: '2026-09-02',
    kategori: 'fakta',
    cover: cover('ksp-artikel-kenapa-c'),
    excerpt:
      'Umurnya sudah lebih dari lima puluh tahun, tapi C masih ada di Linux, Python, sampai mesin cuci. Ini alasannya.',
    penulis: TIM,
    tags: ['fakta', 'sejarah', 'bahasa-c'],
  },
  {
    id: 'n-06',
    slug: 'bahaya-scanf-persen-s',
    judul: 'Berhenti Menulis scanf Persen-s Tanpa Batas Lebar',
    tanggal: '2026-08-30',
    kategori: 'tutorial',
    cover: cover('ksp-berita-scanf'),
    excerpt:
      'Satu baris yang sering muncul di program pemula, dan hampir selalu menyimpan masalah. Perbaikannya cuma satu angka, dan angkanya bukan yang kamu kira.',
    penulis: TIM,
    tags: ['string', 'tutorial', 'keamanan'],
  },
  {
    id: 'n-01',
    slug: 'pendaftaran-anggota-baru-2026',
    judul: 'Pendaftaran Anggota Baru Semester Ganjil 2026/2027 Dibuka',
    tanggal: '2026-08-24',
    kategori: 'pengumuman',
    cover: cover('ksp-berita-pendaftaran'),
    excerpt:
      'Terbuka untuk mahasiswa aktif UAJY semester 1 sebagai persiapan mata kuliah dasar pemrograman C, tanpa syarat kemampuan awal. Biaya Rp150.000 dengan cashback 70%.',
    penulis: 'Pengurus KSP',
    tags: ['pendaftaran', 'anggota-baru', 'kelas'],
  },
]
