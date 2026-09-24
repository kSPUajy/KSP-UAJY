import 'server-only'

import type { Winner } from '@/lib/types'

/**
 * One record per win. `slug` identifies the person and repeats across their
 * wins; `id` is unique and also names the solution file in
 * `src/content/solutions/<id>.c`, which the accessor loads.
 *
 * `totalMenang` is all-time. The club has been running weekly challenges since
 * 2025, and only this semester's twelve are published as pages — so a profile
 * can legitimately show more wins than there are records here. The hall of
 * fame prints both numbers side by side rather than pretending they are one.
 */
export type WinnerSource = Omit<Winner, 'kodeSolusi'>

const portrait = (seed: string): string => `https://picsum.photos/seed/${seed}/640/800`

export const winnerSources: readonly WinnerSource[] = [
  {
    id: 'w-01',
    slug: 'nadia-puspita-ramadhani',
    nama: 'Nadia Puspita Ramadhani',
    foto: portrait('ksp-member-nadia'),
    angkatan: 2024,
    challengeId: 'c-01',
    minggu: 1,
    waktuSubmit: '2026-07-06T20:14',
    runtimeMs: 2,
    pendekatan:
      'Satu lintasan saja sudah cukup. Nilai awal untuk tertinggi dan terendah saya ambil dari elemen pertama, bukan dari nol — kalau semua suhunya negatif, memulai dari nol membuat tertinggi selamanya salah. Total saya simpan sebagai long supaya seribu pembacaan bersuhu 100 pun tidak mendekati batas. Bagian yang paling banyak menjatuhkan orang bukan logikanya, melainkan pembagian bulat di baris terakhir.',
    quote: 'Soal pemanasan yang ternyata punya satu jebakan. Saya submit dua kali.',
    totalMenang: 6,
  },
  {
    id: 'w-02',
    slug: 'rangga-dwi-saputra',
    nama: 'Rangga Dwi Saputra',
    foto: portrait('ksp-member-rangga'),
    angkatan: 2025,
    challengeId: 'c-02',
    minggu: 2,
    waktuSubmit: '2026-07-15T22:47',
    runtimeMs: 4,
    pendekatan:
      'Larangan memakai kurung siku memaksa saya berhenti menganggap array dan pointer sebagai dua hal berbeda. Saya simpan satu pointer ke elemen pertama dan satu ke posisi tepat setelah elemen terakhir, lalu maju k langkah setiap putaran. Perbandingannya p < akhir, bukan menghitung indeks — jadi tidak ada satu pun perkalian dalam perulangannya.',
    quote: 'Ternyata selama ini saya menulis *(data + i) terus, cuma tidak sadar.',
    totalMenang: 2,
  },
  {
    id: 'w-03',
    slug: 'theresia-maharani-putri',
    nama: 'Theresia Maharani Putri',
    foto: portrait('ksp-member-theresia'),
    angkatan: 2025,
    challengeId: 'c-03',
    minggu: 3,
    waktuSubmit: '2026-07-20T19:05',
    runtimeMs: 1,
    pendekatan:
      'Saya coba dulu membandingkan langsung sambil melompati spasi dan tanda baca dari dua arah, dan langsung berantakan di kalimat yang punya tanda baca beruntun. Menyalin karakter yang lolos saringan ke buffer baru memakai memori ekstra, tapi seluruh logikanya jadi muat dalam satu while yang bisa saya baca sekali jalan. Untuk 200 karakter, memori bukan masalah.',
    quote: 'Pelajarannya: kode yang lebih pendek belum tentu kode yang lebih benar.',
    totalMenang: 9,
  },
  {
    id: 'w-04',
    slug: 'theresia-maharani-putri',
    nama: 'Theresia Maharani Putri',
    foto: portrait('ksp-member-theresia'),
    angkatan: 2025,
    challengeId: 'c-04',
    minggu: 4,
    waktuSubmit: '2026-07-27T21:32',
    runtimeMs: 3,
    pendekatan:
      'Kuncinya menyimpan digit satuan di indeks nol. Dengan urutan itu, sisa penyimpanan merambat maju ke indeks yang lebih besar dan array-nya tumbuh ke arah yang sama — tidak ada penggeseran sama sekali. Kesalahan saya yang pertama: menghabiskan sisa penyimpanan dengan satu if. Untuk faktor dua digit, sisanya bisa lebih dari sembilan dan harus dihabiskan dengan while.',
    quote: 'Perkalian bersusun yang diajarkan di SD ternyata algoritma yang benar-benar dipakai.',
    totalMenang: 9,
  },
  {
    id: 'w-05',
    slug: 'gilang-prasetyo-nugroho',
    nama: 'Gilang Prasetyo Nugroho',
    foto: portrait('ksp-member-gilang'),
    angkatan: 2024,
    challengeId: 'c-05',
    minggu: 5,
    waktuSubmit: '2026-08-03T18:22',
    runtimeMs: 6,
    pendekatan:
      'Struct-nya sengaja saya buat menyimpan nama sebagai array, bukan pointer. Kalau nama disimpan sebagai char*, qsort akan menukar pointer-nya dan itu masih benar, tapi saya harus menjamin memori yang ditunjuk tetap hidup. Array di dalam struct ikut berpindah saat elemennya ditukar, jadi tidak ada yang perlu dijaga. Pembanding mengembalikan selisih nilai untuk kunci pertama dan hasil strcmp apa adanya untuk kunci kedua.',
    quote: 'Dua array paralel itu bom waktu. Satu struct menyelesaikan semuanya.',
    totalMenang: 8,
  },
  {
    id: 'w-06',
    slug: 'kevin-alexander-tanuwijaya',
    nama: 'Kevin Alexander Tanuwijaya',
    foto: portrait('ksp-member-kevin'),
    angkatan: 2024,
    challengeId: 'c-06',
    minggu: 6,
    waktuSubmit: '2026-08-14T23:11',
    runtimeMs: 5,
    pendekatan:
      'Submission pertama saya lolos semua contoh tapi ditolak karena kebocoran memori: saya hanya membebaskan simpul yang diambil lewat perintah A, dan lupa sisanya saat program berakhir. Perbaikannya satu perulangan di akhir main. Satu hal lagi yang saya catat: pada perintah A, pointer ke simpul berikutnya harus disimpan sebelum free, bukan sesudah. Versi yang salah tetap jalan di laptop saya, dan itu justru yang berbahaya.',
    quote: 'Program yang kelihatan jalan dan program yang benar itu dua hal berbeda.',
    totalMenang: 3,
  },
  {
    id: 'w-07',
    slug: 'salsabila-rahmawati',
    nama: 'Salsabila Rahmawati',
    foto: portrait('ksp-member-salsabila'),
    angkatan: 2025,
    challengeId: 'c-07',
    minggu: 7,
    waktuSubmit: '2026-08-18T20:40',
    runtimeMs: 9,
    pendekatan:
      'Empat batas yang menyusut, dan dua penjagaan tambahan sebelum melintasi sisi bawah dan sisi kiri. Tanpa dua penjagaan itu, matriks satu baris akan mencetak barisnya dua kali — sekali dari kiri ke kanan, sekali dari kanan ke kiri. Kasus itu tidak ada di contoh yang diberikan, jadi saya menemukannya hanya karena iseng menguji 1 x 5 sendiri.',
    quote: 'Contoh yang diberikan itu lantai, bukan langit-langit. Uji sendiri yang lain.',
    totalMenang: 2,
  },
  {
    id: 'w-08',
    slug: 'yohanes-krisna-adiputra',
    nama: 'Yohanes Krisna Adiputra',
    foto: portrait('ksp-member-yohanes'),
    angkatan: 2024,
    challengeId: 'c-08',
    minggu: 8,
    waktuSubmit: '2026-08-29T16:58',
    runtimeMs: 12,
    pendekatan:
      'strchr untuk menemukan titik koma, lalu menimpanya dengan karakter nol. Satu baris itu langsung memotong string jadi dua tanpa menyalin apa pun: bagian sebelum titik koma jadi nama, dan pointer setelahnya langsung bisa diberikan ke strtol. Bagian yang paling saya perhatikan justru fclose setelah menulis — tanpa itu, sebagian isi berkas masih di buffer saat saya membukanya kembali, dan keluarannya terpotong.',
    quote: 'fclose bukan formalitas. Itu yang benar-benar mengirim data ke disk.',
    totalMenang: 4,
  },
  {
    id: 'w-09',
    slug: 'ivana-christabel-sudarsono',
    nama: 'Ivana Christabel Sudarsono',
    foto: portrait('ksp-member-ivana'),
    angkatan: 2024,
    challengeId: 'c-09',
    minggu: 9,
    waktuSubmit: '2026-09-04T21:03',
    runtimeMs: 31,
    pendekatan:
      'Kapasitas awal empat, digandakan setiap kali penuh. Yang membuat saya berhenti sebentar adalah baris realloc. Menulis data = realloc(data, ...) kelihatan wajar sampai kamu sadar bahwa kalau realloc gagal, ia mengembalikan NULL tanpa membebaskan blok lama — dan kamu baru saja menimpa satu-satunya pointer ke blok itu. Hasilnya saya tampung dulu di variabel sementara, dan blok lama baru dilepas kalau realokasinya berhasil.',
    quote: 'Baris yang paling berbahaya di program saya justru yang paling pendek.',
    totalMenang: 3,
  },
  {
    id: 'w-10',
    slug: 'damar-aji-setiawan',
    nama: 'Damar Aji Setiawan',
    foto: portrait('ksp-member-damar'),
    angkatan: 2023,
    challengeId: 'c-10',
    minggu: 10,
    waktuSubmit: '2026-09-07T22:19',
    runtimeMs: 88,
    pendekatan:
      'Rekursinya sendiri tujuh baris dan tidak berubah dari versi pertama. Yang saya ubah adalah penghitung langkah: awalnya saya kirim sebagai parameter dan mengembalikannya lagi, yang membuat tanda tangan fungsinya berantakan. Satu variabel static jauh lebih jelas untuk kasus ini. Banyaknya langkah saya hitung langsung dengan pergeseran bit, bukan dengan menghitung berapa kali fungsinya dipanggil.',
    quote: 'Kalau kasus dasarnya benar, sisanya hampir selalu menulis dirinya sendiri.',
    totalMenang: 5,
  },
  {
    id: 'w-11',
    slug: 'fransiska-ayu-larasati',
    nama: 'Fransiska Ayu Larasati',
    foto: portrait('ksp-member-fransiska'),
    angkatan: 2024,
    challengeId: 'c-11',
    minggu: 11,
    waktuSubmit: '2026-09-19T14:26',
    runtimeMs: 15,
    pendekatan:
      'Daripada menulis empat pasang SET dan GET, saya buat satu tabel berisi nama medan, besar pergeseran, dan maskernya. Setelah itu SET dan GET masing-masing cukup ditulis sekali. Dua hal yang saya jaga: statusnya unsigned, karena pergeseran kiri pada bilangan bertanda yang meluap tidak terdefinisi; dan nilai baru selalu di-AND dengan maskernya sebelum digeser, supaya masukan yang melebihi lebar medan tidak pernah merembet ke medan tetangga.',
    quote: 'Menang pertama saya, dan kebetulan di soal SEGFAULT. Saya masih agak kaget.',
    totalMenang: 1,
  },
]
