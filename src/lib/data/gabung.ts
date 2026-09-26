import 'server-only'

import type { JoinInfo, RegistrationWindow } from '@/lib/types'

/**
 * What joining involves. Every fact here matches the registration
 * announcement in `src/content/news/pendaftaran-anggota-baru-2026.mdx` — if
 * the club changes its schedule or rules, change both.
 */
export const joinInfo: JoinInfo = {
  ringkasan:
    'Kelas untuk mahasiswa semester 1, disusun untuk mempersiapkan mata kuliah dasar pemrograman berbahasa C. Belum pernah menulis satu baris kode pun? Tidak masalah — kelasnya dimulai dari nol, dengan tentor yang mendampingi dari pertemuan pertama.',
  syarat: [
    'Mahasiswa aktif UAJY semester 1',
    'Tidak ada syarat kemampuan awal',
    'Biaya pendaftaran Rp150.000 — cashback 70% kalau presensimu memenuhi',
  ],
  manfaat: [
    {
      id: 'kelas-rutin',
      judul: 'kelas rutin',
      deskripsi: 'Setiap Senin dan Selasa, 19.00–21.00 WIB, di Lab Komputasi.',
    },
    {
      id: 'pendampingan',
      judul: 'pendampingan',
      deskripsi: 'Satu tentor untuk empat peserta, dari pertemuan pertama.',
    },
    {
      id: 'challenge',
      judul: 'challenge mingguan',
      deskripsi: 'Soal baru tiap Senin, dengan pembahasan solusi yang terbuka.',
    },
    {
      id: 'arsip',
      judul: 'arsip materi',
      deskripsi: 'Akses ke seluruh modul dan soal latihan.',
    },
    {
      id: 'sertifikat',
      judul: 'sertifikat',
      deskripsi: 'Sertifikat keanggotaan di akhir tahun ajaran, bisa ditukar SPAMA tipe organisasi.',
    },
  ],
  langkah: [
    {
      id: 'formulir',
      judul: 'Isi formulir pendaftaran',
      deskripsi:
        'Nama, NPM, angkatan, dan satu pertanyaan: pernah menulis kode atau belum. Jawabannya tidak menentukan diterima atau tidak — hanya menentukan jalur.',
      kapan: 'selama pendaftaran dibuka',
    },
    {
      id: 'perkenalan',
      judul: 'Ikut sesi perkenalan',
      deskripsi:
        'Satu jam bersama pengurus dan tentor. Bukan seleksi, tidak ada yang ditolak — sesi ini ada supaya kamu bisa bertanya sebelum memutuskan.',
      kapan: 'sehari setelah pendaftaran ditutup',
    },
    {
      id: 'jalur',
      judul: 'Pilih jalur kelas',
      deskripsi:
        'Jalur dasar untuk yang belum pernah memrogram, jalur lanjut untuk yang sudah pernah menulis kode, misalnya waktu SMA. Tentor membantu memilih kalau kamu ragu.',
      kapan: 'di akhir sesi perkenalan',
    },
    {
      id: 'kelas-pertama',
      judul: 'Datang ke kelas pertama',
      deskripsi:
        'Bawa laptop kalau punya. Kalau tidak, Lab Komputasi menyediakan komputer, dan tentormu sudah tahu namamu.',
      kapan: 'sepekan setelah sesi perkenalan',
    },
  ],
  faq: [
    {
      id: 'belum-bisa',
      pertanyaan: 'Saya belum pernah memrogram sama sekali. Masih boleh daftar?',
      jawaban:
        'Justru jalur dasar dibuat untukmu. Semester lalu sembilan dari dua puluh tujuh anggota baru mendaftar tanpa pengalaman apa pun, dan empat di antaranya sekarang ada di papan peringkat challenge.',
    },
    {
      id: 'bukan-informatika',
      pertanyaan: 'Saya bukan mahasiswa Informatika.',
      jawaban:
        'Tidak masalah. Syaratnya hanya mahasiswa aktif UAJY semester 1. Anggota kami datang dari Sistem Informasi, Teknik Industri, bahkan Akuntansi.',
    },
    {
      id: 'biaya',
      pertanyaan: 'Berapa biayanya?',
      jawaban:
        'Biaya pendaftarannya Rp150.000, dibayar sekali. Kalau presensimu memenuhi, 70% — Rp105.000 — dikembalikan sebagai cashback. Tidak ada iuran bulanan dan tidak ada buku yang harus dibeli; semua materi ada di arsip anggota.',
    },
    {
      id: 'laptop',
      pertanyaan: 'Perlu laptop sendiri?',
      jawaban:
        'Tidak wajib. Kelas berjalan di Lab Komputasi, yang komputernya sudah terpasang gcc. Kalau kamu membawa laptop, tentor akan membantu memasang kompilernya di pertemuan pertama.',
    },
    {
      id: 'waktu',
      pertanyaan: 'Berapa jam seminggu yang perlu saya sediakan?',
      jawaban:
        'Kelasnya Senin dan Selasa, 19.00–21.00 WIB — dua pertemuan untuk satu materi, di minggu-minggu yang ada modulnya. Challenge mingguan sifatnya sukarela — sebagian anggota mengerjakan setiap minggu, sebagian hanya kalau topiknya menarik.',
    },
    {
      id: 'bolos',
      pertanyaan: 'Bagaimana kalau saya tidak bisa datang di satu pertemuan?',
      jawaban:
        'Modul dan soalnya masuk arsip di hari yang sama, dan tentormu bisa ditanya lewat grup. Satu-dua pertemuan terlewat tidak membuatmu keluar, tapi ingat presensi menentukan cashback 70% dari biaya pendaftaran.',
    },
    {
      id: 'tengah-semester',
      pertanyaan: 'Pendaftaran sudah tutup. Bisa masuk di tengah semester?',
      jawaban:
        'Kelas tidak menerima peserta baru di tengah jalan, tapi challenge mingguan terbuka untuk semua mahasiswa UAJY kapan pun. Banyak anggota kami masuk lewat pintu itu dulu.',
    },
  ],
}

/**
 * The first registration round, for `scripts/generate-seed.mts` only. The
 * live value is the newest row of `registration_rounds`, which admins edit;
 * the round the announcement describes opened the day it was posted and
 * closed at the end of 11 September.
 */
export const registrationSeed: RegistrationWindow = {
  buka: '2026-08-24T00:00',
  tutup: '2026-09-11T23:59',
}
