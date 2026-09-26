import 'server-only'

import type { NewsPost } from '@/lib/types'

/**
 * Article metadata. The body is not here — it lives in
 * `src/content/news/<slug>.mdx` and the accessor loads it.
 *
 * Apart from the registration notice, these are articles about C itself —
 * facts and beginner tips — rather than reports of events, so nothing here
 * describes something that did not happen. Signed "Tim KSP", not a person.
 *
 * Covers are CC0 photos found through Openverse, cropped to 1200 × 675 and
 * stored in the `media` bucket; the line above each says where it came from.
 */
export type NewsSource = Omit<NewsPost, 'bodyMdx'>

const TIM = 'Tim KSP'

export const newsSources: readonly NewsSource[] = [
  {
    id: 'n-15',
    slug: 'sepuluh-fakta-lain-bahasa-c',
    judul: 'Sepuluh Fakta Lain tentang Bahasa C',
    tanggal: '2026-09-26',
    kategori: 'fakta',
    // stocksnap, CC0: https://stocksnap.io/photo/floppy-disk-5SNBAUPE1V
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/e0bb080d-d8d1-4f5b-91c4-f69644675b08.jpg',
    excerpt:
      'Huruf yang sebenarnya angka, nol di depan yang mengubah arti, sampai lomba menulis kode paling membingungkan. Sepuluh kejutan kecil lagi dari bahasa C.',
    penulis: TIM,
    tags: ['fakta', 'bahasa-c', 'pemula'],
  },
  {
    id: 'n-14',
    slug: 'kebiasaan-kecil-kode-c-rapi',
    judul: 'Lima Kebiasaan Kecil Supaya Kode C Lebih Rapi',
    tanggal: '2026-09-24',
    kategori: 'tips',
    // stocksnap, CC0: https://stocksnap.io/photo/digital-clock-0NV2FAVPAX
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/1ab11745-52ea-45a8-88aa-ec7bc33a2e59.jpg',
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
    // rawpixel, CC0: https://www.rawpixel.com/image/5904368/photo-image-public-domain-black-newspaper
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/00111d5a-7bbe-4182-a423-23cd0e53f258.jpg',
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
    // rawpixel, CC0: https://www.rawpixel.com/image/6030459/photo-image-public-domain-black-free
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/566f4709-6d64-494e-9d98-9de42229c288.jpg',
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
    // stocksnap, CC0: https://stocksnap.io/photo/programming-code-1STVFMTBJY
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/3e9f10a7-259c-41ee-b11f-abda21917f6a.jpg',
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
    // stocksnap, CC0: https://stocksnap.io/photo/macintosh-computer-7NWB2A8I0R
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/2c2fbd7c-f51c-4327-958c-a6e4a0c2bec2.jpg',
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
    // rawpixel, CC0: https://www.rawpixel.com/image/5907875/photo-image-public-domain-technology-computer
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/196c9108-f12c-4f79-93a9-9b612ab10ffe.jpg',
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
    // stocksnap, CC0: https://stocksnap.io/photo/macbook-laptop-CJSRRVR4JE
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/964a775e-e74c-420d-a713-3e59b8a269ed.jpg',
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
    // stocksnap, CC0: https://stocksnap.io/photo/working-laptop-7FQSNWO04W
    cover: 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/03028986-34f7-4b14-aa0d-cceaaa4142d7.jpg',
    excerpt:
      'Terbuka untuk mahasiswa aktif UAJY semester 1 sebagai persiapan mata kuliah dasar pemrograman C, tanpa syarat kemampuan awal. Biaya Rp150.000 dengan cashback 70%.',
    penulis: 'Pengurus KSP',
    tags: ['pendaftaran', 'anggota-baru', 'kelas'],
  },
]
