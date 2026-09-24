import 'server-only'

import type { Modul } from '@/lib/types'

/**
 * The semester's class modules, one per week, from the module schedule the
 * coordinators keep.
 *
 * `rilis` is the Monday each module is handed out. Week 1 starts on Monday
 * 14 September 2026, the week of the first class. A holiday or a midterm
 * break is a matter of moving the later dates; nothing else needs to change.
 *
 * `berkasUrl` stays empty until a module file exists — the page says the file
 * is on its way rather than showing a dead link.
 */
export const modulSources: readonly Omit<Modul, 'tugasDeskripsi'>[] = [
  {
    id: 'mod-01',
    minggu: 1,
    judul: 'Flowchart 1',
    rilis: '2026-09-14',
    tentorPj: ['Sabrina', 'Eldha'],
    koordinator: 'Michelle',
    ringkasan:
      'Simbol-simbol flowchart dan alur urut: terminal, proses, masukan dan keluaran, serta cara membaca diagram dari atas ke bawah.',
  },
  {
    id: 'mod-02',
    minggu: 2,
    judul: 'Flowchart 2',
    rilis: '2026-09-21',
    tentorPj: ['Sabrina', 'Eldha'],
    koordinator: 'Michelle',
    ringkasan:
      'Percabangan dan perulangan di flowchart: simbol keputusan, alur yang kembali ke atas, dan menelusuri diagram dengan tabel jejak.',
  },
  {
    id: 'mod-03',
    minggu: 3,
    judul: 'Penamaan, Tipe, Sekuens',
    rilis: '2026-09-28',
    tentorPj: ['Boby', 'Kley'],
    koordinator: 'Kley',
    ringkasan:
      'Aturan penamaan variabel, tipe data dasar di C, dan program sekuensial pertama dengan printf dan scanf.',
  },
  {
    id: 'mod-04',
    minggu: 4,
    judul: 'Pemilihan',
    rilis: '2026-10-05',
    tentorPj: ['Dwi', 'Andrew'],
    koordinator: 'Kley',
    ringkasan: 'if, else if, else, dan switch — memilih jalur program berdasarkan kondisi.',
  },
  {
    id: 'mod-05',
    minggu: 5,
    judul: 'Perulangan 1',
    rilis: '2026-10-12',
    tentorPj: ['Ardhya', 'Beto'],
    koordinator: 'Rena',
    ringkasan: 'for dan while: menghitung, menjumlahkan, dan menentukan kapan sebuah perulangan berhenti.',
  },
  {
    id: 'mod-06',
    minggu: 6,
    judul: 'Perulangan 2',
    rilis: '2026-10-19',
    tentorPj: ['Doni', 'Rena'],
    koordinator: 'Rena',
    ringkasan: 'do-while, perulangan bersarang, serta break dan continue.',
  },
  {
    id: 'mod-07',
    minggu: 7,
    judul: 'Prosedur 1',
    rilis: '2026-10-26',
    tentorPj: ['Richard', 'Petra'],
    koordinator: 'Richard',
    ringkasan: 'Memecah program menjadi prosedur: deklarasi, pemanggilan, dan parameter masukan.',
  },
  {
    id: 'mod-08',
    minggu: 8,
    judul: 'Prosedur 2',
    rilis: '2026-11-02',
    tentorPj: ['Adit', 'Tristan'],
    koordinator: 'Richard',
    ringkasan:
      'Parameter keluaran: kenapa nilai yang diubah di dalam prosedur tidak ikut kembali, dan cara memperbaikinya dengan pointer.',
  },
  {
    id: 'mod-09',
    minggu: 9,
    judul: 'Fungsi',
    rilis: '2026-11-09',
    tentorPj: ['Nathan', 'Stella'],
    koordinator: 'Michelle',
    ringkasan: 'Fungsi yang mengembalikan nilai, return, dan kapan memilih fungsi daripada prosedur.',
  },
  {
    id: 'mod-10',
    minggu: 10,
    judul: 'Array',
    rilis: '2026-11-16',
    tentorPj: ['Albert', 'Nadya'],
    koordinator: 'Audrey',
    ringkasan: 'Array satu dimensi: indeks, perulangan atas array, pencarian, dan nilai terbesar atau terkecil.',
  },
  {
    id: 'mod-11',
    minggu: 11,
    judul: 'Record',
    rilis: '2026-11-23',
    tentorPj: ['Jolie', 'Epun'],
    koordinator: 'Audrey',
    ringkasan: 'struct sebagai record: mengelompokkan data yang saling berkaitan dan mengakses tiap field-nya.',
  },
  {
    id: 'mod-12',
    minggu: 12,
    judul: 'Array of Record',
    rilis: '2026-11-30',
    tentorPj: ['Albert', 'Adit'],
    koordinator: 'Audrey',
    ringkasan: 'Menggabungkan keduanya: array berisi struct untuk data berbentuk tabel, seperti daftar nilai satu kelas.',
  },
]
