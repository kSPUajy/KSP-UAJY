import 'server-only'

import type { Modul, Sesi } from '@/lib/types'

/**
 * The semester's class modules, one per week, from the module schedule the
 * coordinators keep.
 *
 * `rilis` is the Monday of each module's first class, from the tentoring
 * schedule ("Jadwal Materi Tentoring KSP C"): Monday and Tuesday sessions,
 * one tentor each. The schedule is not weekly — midterms, holidays, and the
 * Games and Review sessions (which are not modules) leave gaps.
 *
 * `berkasUrl` stays empty until a module file exists — the page says the file
 * is on its way rather than showing a dead link.
 */
export const modulSources: readonly Omit<Modul, 'tugasDeskripsi'>[] = [
  {
    id: 'mod-01',
    minggu: 1,
    judul: 'Flowchart 1',
    rilis: '2026-09-21',
    tentorPj: ['Sabrina', 'Eldha'],
    koordinator: 'Michelle',
    ringkasan:
      'Simbol-simbol flowchart dan alur urut: terminal, proses, masukan dan keluaran, serta cara membaca diagram dari atas ke bawah.',
  },
  {
    id: 'mod-02',
    minggu: 2,
    judul: 'Flowchart 2',
    rilis: '2026-09-28',
    tentorPj: ['Sabrina', 'Eldha'],
    koordinator: 'Michelle',
    ringkasan:
      'Percabangan dan perulangan di flowchart: simbol keputusan, alur yang kembali ke atas, dan menelusuri diagram dengan tabel jejak.',
  },
  {
    id: 'mod-03',
    minggu: 3,
    judul: 'Tipe Data',
    rilis: '2026-10-05',
    tentorPj: ['Boby', 'Kley'],
    koordinator: 'Kley',
    ringkasan:
      'Aturan penamaan variabel, tipe data dasar di C, dan program sekuensial pertama dengan printf dan scanf.',
  },
  {
    id: 'mod-04',
    minggu: 4,
    judul: 'Pemilihan',
    rilis: '2026-11-02',
    tentorPj: ['Dwi', 'Andrew'],
    koordinator: 'Kley',
    ringkasan: 'if, else if, else, dan switch — memilih jalur program berdasarkan kondisi.',
  },
  {
    id: 'mod-05',
    minggu: 5,
    judul: 'Perulangan 1',
    rilis: '2026-11-09',
    tentorPj: ['Ardhya', 'Beto'],
    koordinator: 'Rena',
    ringkasan: 'for dan while: menghitung, menjumlahkan, dan menentukan kapan sebuah perulangan berhenti.',
  },
  {
    id: 'mod-06',
    minggu: 6,
    judul: 'Perulangan 2',
    rilis: '2026-11-16',
    tentorPj: ['Doni', 'Rena'],
    koordinator: 'Rena',
    ringkasan: 'do-while, perulangan bersarang, serta break dan continue.',
  },
  {
    id: 'mod-07',
    minggu: 7,
    judul: 'Prosedur 1',
    rilis: '2026-11-23',
    tentorPj: ['Richard', 'Petra'],
    koordinator: 'Richard',
    ringkasan: 'Memecah program menjadi prosedur: deklarasi, pemanggilan, dan parameter masukan.',
  },
  {
    id: 'mod-08',
    minggu: 8,
    judul: 'Prosedur 2',
    rilis: '2027-03-01',
    tentorPj: ['Adit', 'Tristan'],
    koordinator: 'Richard',
    ringkasan:
      'Parameter keluaran: kenapa nilai yang diubah di dalam prosedur tidak ikut kembali, dan cara memperbaikinya dengan pointer.',
  },
  {
    id: 'mod-09',
    minggu: 9,
    judul: 'Fungsi',
    rilis: '2027-03-15',
    tentorPj: ['Nathan', 'Stella'],
    koordinator: 'Michelle',
    ringkasan: 'Fungsi yang mengembalikan nilai, return, dan kapan memilih fungsi daripada prosedur.',
  },
  {
    id: 'mod-10',
    minggu: 10,
    judul: 'Array',
    rilis: '2027-04-26',
    tentorPj: ['Albert', 'Nadya'],
    koordinator: 'Audrey',
    ringkasan: 'Array satu dimensi: indeks, perulangan atas array, pencarian, dan nilai terbesar atau terkecil.',
  },
  {
    id: 'mod-11',
    minggu: 11,
    judul: 'Record',
    rilis: '2027-05-03',
    tentorPj: ['Jolie', 'Epun'],
    koordinator: 'Audrey',
    ringkasan: 'struct sebagai record: mengelompokkan data yang saling berkaitan dan mengakses tiap field-nya.',
  },
  {
    id: 'mod-12',
    minggu: 12,
    judul: 'Array of Record',
    rilis: '2027-05-18',
    tentorPj: ['Adit'],
    // One session only, on the Tuesday; due that Sunday.
    tenggat: '2027-05-23T23:59',
    koordinator: 'Audrey',
    ringkasan: 'Menggabungkan keduanya: array berisi struct untuk data berbentuk tabel, seperti daftar nilai satu kelas.',
  },
]

/**
 * Sessions on the schedule that are not modules: on the timeline, with no
 * guided task and nothing to grade.
 */
export const sesiSources: readonly Sesi[] = [
  {
    id: 'sesi-games',
    judul: 'Games',
    rilis: '2026-11-30',
    pj: 'PH',
    ringkasan: 'Sesi santai di akhir semester ganjil: permainan dan kuis seputar materi yang sudah dipelajari. Tanpa modul dan tanpa tugas.',
  },
  {
    id: 'sesi-review',
    judul: 'Review Materi',
    rilis: '2027-02-22',
    pj: 'PH',
    ringkasan: 'Mengulang materi semester ganjil sebelum lanjut ke prosedur dan fungsi. Tanpa modul dan tanpa tugas.',
  },
]
