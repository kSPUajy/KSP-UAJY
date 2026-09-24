import 'server-only'

import type { AboutInfo } from '@/lib/types'

/**
 * `/tentang`. Every milestone from 2025 on is also told somewhere else on the
 * site — a news post, a gallery caption — so the dates here have to agree
 * with those. The first entry is the exception.
 */
export const aboutInfo: AboutInfo = {
  pembuka: [
    'Kelompok Studi Pemrograman adalah komunitas belajar bahasa C di Program Studi Informatika UAJY. Kami bukan unit kegiatan dengan seleksi masuk, dan bukan kelas tambahan dengan nilai. Kami sekelompok mahasiswa yang bertemu tiap Jumat sore untuk membaca, menulis, dan merusak program C bersama-sama.',
    'Kelasnya dipegang tentor sebaya — kakak tingkat yang dua atau tiga semester lalu duduk di kursi yang sama. Soalnya ditulis sendiri, pembahasannya terbuka, dan setiap kesalahan yang pernah membuat program kami crash dijadikan materi untuk angkatan berikutnya.',
  ],
  prinsip: [
    {
      id: 'baca-dulu',
      judul: 'Baca sebelum menulis',
      deskripsi:
        'Pertemuan pertama jalur dasar tidak dimulai dengan printf, tapi dengan membaca kode orang lain dan menebak keluarannya. Menulis datang setelah membaca.',
    },
    {
      id: 'tidak-ada-sihir',
      judul: 'Tidak ada yang disembunyikan',
      deskripsi:
        'C tidak mengalokasikan memori diam-diam, dan kami juga tidak. Setiap pointer digambar di papan, setiap malloc punya free yang bisa ditunjuk.',
    },
    {
      id: 'salah-di-depan',
      judul: 'Salah di depan umum',
      deskripsi:
        'Solusi pemenang dipublikasikan bersama percobaan yang gagal lebih dulu. Cerita tentang segfault jam sebelas malam lebih banyak mengajarkan daripada kode yang sudah rapi.',
    },
    {
      id: 'terbuka',
      judul: 'Pintu selalu terbuka',
      deskripsi:
        'Tidak ada seleksi, tidak ada iuran, tidak ada syarat kemampuan awal. Challenge mingguan terbuka bahkan untuk yang belum mendaftar sebagai anggota.',
    },
  ],
  sejarah: [
    {
      // TODO(brand): founding year and story are placeholders — replace with
      // the club's real origin before launch.
      periode: '2023',
      judul: 'Dimulai dari satu meja di laboratorium',
      deskripsi:
        'Beberapa mahasiswa angkatan 2023 mulai bertemu setelah kuliah Algoritma dan Pemrograman untuk mengulang materi pointer yang tidak sempat dibahas tuntas di kelas.',
    },
    {
      periode: 'Sep 2025',
      judul: 'Workshop pembuka semester, 42 peserta',
      deskripsi:
        'Workshop pengenalan bahasa C yang terbuka untuk seluruh mahasiswa. Proyektornya sempat mati, pesertanya tidak ada yang pulang.',
    },
    {
      periode: 'Okt 2025',
      judul: 'Workshop manajemen memori',
      deskripsi:
        'Dibuka dengan menggambar, bukan dengan malloc. Rekamannya kini jadi materi wajib jalur lanjut.',
    },
    {
      periode: 'Des 2025',
      judul: 'Kompetisi internal akhir semester',
      deskripsi:
        '34 peserta, delapan soal, tiga jam — dan untuk pertama kalinya juaranya mahasiswa tahun pertama.',
    },
    {
      periode: 'Feb 2026',
      judul: 'Satu tentor untuk empat peserta',
      deskripsi:
        '27 anggota baru di semester genap, dan sistem pendampingan yang dipakai sampai sekarang mulai berjalan.',
    },
    {
      periode: 'Mei 2026',
      judul: 'Peringkat empat se-DIY',
      deskripsi:
        'Delapan dari sebelas soal di lomba pemrograman antarkampus, terpaut satu soal dari podium.',
    },
    {
      periode: 'Jul 2026',
      judul: 'Challenge mingguan musim kedua',
      deskripsi:
        'Dua belas soal, tingkat SEGFAULT, petunjuk yang terkunci, dan solusi pemenang yang terbit bersama cerita pendekatannya.',
    },
  ],
  sekretariat: {
    lokasi: 'Gedung Bonaventura, UAJY',
    jadwalKelas: 'Jumat sore, 90 menit, ruang FTI 3.2',
  },
}
