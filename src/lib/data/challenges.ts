import 'server-only'

import type { Challenge } from '@/lib/types'

/**
 * Challenge metadata. The problem statement is not here — it lives in
 * `src/content/challenges/<slug>.mdx` and the accessor loads it.
 *
 * One challenge per class module, released the Monday the module starts and
 * due that Sunday, so a challenge never asks for more than the class has
 * covered. `minggu` matches the module's week. Weeks 1–2 (Flowchart) come
 * before any C and have no challenge.
 *
 * Every `sampleIO` pair is verified against the winning solution by
 * `scripts/verify-c.mjs`, which compiles the submission and diffs its real
 * output against what is written below.
 */
export type ChallengeSource = Omit<Challenge, 'deskripsiMdx'>

export const challengeSources: readonly ChallengeSource[] = [
  {
    id: 'c-03',
    slug: 'durasi-praktikum',
    minggu: 3,
    judul: 'Durasi Praktikum',
    tanggalRilis: '2026-10-05',
    deadline: '2026-10-11T23:59',
    difficulty: 'MUDAH',
    topik: ['tipe-data'],
    constraints: [
      '0 <= N <= 1000000',
      'Keluaran persis satu baris',
      'Batas waktu 1 detik, batas memori 64 MB',
    ],
    sampleIO: [
      {
        input: '7384',
        output: '2 jam 3 menit 4 detik',
        penjelasan: '7384 detik = 2 × 3600 + 3 × 60 + 4.',
      },
      {
        input: '59',
        output: '0 jam 0 menit 59 detik',
        penjelasan: 'Kurang dari satu menit, jam dan menitnya tetap dicetak sebagai 0.',
      },
      {
        input: '86400',
        output: '24 jam 0 menit 0 detik',
        penjelasan: 'Satu hari penuh. Jam tidak dibatasi sampai 23.',
      },
    ],
    hintTerkunci: [
      'Satu jam sama dengan 3600 detik, satu menit 60 detik.',
      'Operator / pada dua bilangan bulat membuang sisanya. Operator % justru mengambil sisanya.',
      'Setelah jam diambil, sisa detiknya adalah N % 3600. Dari sisa itu baru hitung menitnya.',
    ],
    totalPeserta: 0,
    tags: ['pemanasan', 'aritmetika'],
  },
  {
    id: 'c-04',
    slug: 'nilai-akhir-semester',
    minggu: 4,
    judul: 'Nilai Akhir Semester',
    tanggalRilis: '2026-11-02',
    deadline: '2026-11-08T23:59',
    difficulty: 'MUDAH',
    topik: ['pemilihan'],
    constraints: [
      'Ketiga nilai berupa bilangan bulat',
      'Nilai di luar 0 sampai 100 dianggap tidak valid',
      'Nilai akhir dicetak dengan tepat dua angka di belakang koma',
    ],
    sampleIO: [
      {
        input: '80 75 90',
        output: 'nilai akhir: 82.50\nhuruf: B',
        penjelasan: '(3 × 80 + 3 × 75 + 4 × 90) / 10 = 82.5, masuk rentang B.',
      },
      {
        input: '85 85 85',
        output: 'nilai akhir: 85.00\nhuruf: A',
        penjelasan: 'Tepat di batas bawah A tetap mendapat A.',
      },
      {
        input: '100 101 90',
        output: 'nilai tidak valid',
        penjelasan: 'Nilai UTS 101 di luar rentang, jadi tidak ada yang dihitung.',
      },
    ],
    hintTerkunci: [
      'Periksa validitas dulu. Kalau satu saja tidak valid, cetak pesannya dan selesai.',
      'Urutkan pemeriksaan huruf dari batas tertinggi ke terendah dengan if – else if.',
      'Bandingkan 3 × tugas + 3 × UTS + 4 × UAS dengan 850, 700, dan seterusnya supaya batasnya tidak meleset karena pecahan.',
    ],
    totalPeserta: 0,
    tags: ['if-else', 'nilai'],
  },
  {
    id: 'c-05',
    slug: 'tabungan-kas-kelas',
    minggu: 5,
    judul: 'Tabungan Kas Kelas',
    tanggalRilis: '2026-11-09',
    deadline: '2026-11-15T23:59',
    difficulty: 'MUDAH',
    topik: ['perulangan'],
    constraints: [
      '1 <= N <= 100',
      '0 <= T <= 10000000',
      '0 <= setoran <= 100000',
    ],
    sampleIO: [
      {
        input: '5 100000\n20000 15000 30000 25000 10000',
        output: 'total: 100000\ntarget tercapai di minggu ke-5',
        penjelasan: 'Total baru menyentuh 100000 setelah setoran kelima.',
      },
      {
        input: '3 50000\n10000 5000 20000',
        output: 'total: 35000\ntarget belum tercapai, kurang 15000',
        penjelasan: 'Sampai minggu terakhir totalnya 35000, masih kurang 15000.',
      },
      {
        input: '1 0\n0',
        output: 'total: 0\ntarget tercapai di minggu ke-1',
        penjelasan: 'Target 0 sudah tercapai begitu minggu pertama dicatat.',
      },
    ],
    hintTerkunci: [
      'Tidak perlu menyimpan semua setoran. Cukup tambahkan ke total setiap kali dibaca.',
      'Simpan minggu tercapainya di variabel tersendiri, dan isi hanya sekali — saat pertama kali total >= T.',
      'Setoran tetap harus dibaca sampai habis walaupun target sudah tercapai lebih awal.',
    ],
    totalPeserta: 0,
    tags: ['for', 'akumulasi'],
  },
  {
    id: 'c-06',
    slug: 'segitiga-angka',
    minggu: 6,
    judul: 'Segitiga Angka',
    tanggalRilis: '2026-11-16',
    deadline: '2026-11-22T23:59',
    difficulty: 'SEDANG',
    topik: ['perulangan'],
    constraints: [
      '1 <= N <= 9',
      'Tidak ada spasi di akhir baris',
    ],
    sampleIO: [
      {
        input: '3',
        output: '  1\n 121\n12321',
        penjelasan: 'Baris ke-i diawali N − i spasi, naik dari 1 sampai i, lalu turun lagi ke 1.',
      },
      {
        input: '1',
        output: '1',
        penjelasan: 'Satu baris, tanpa spasi di depan.',
      },
      {
        input: '5',
        output: '    1\n   121\n  12321\n 1234321\n123454321',
        penjelasan: 'Baris terakhir selalu rata kiri.',
      },
    ],
    hintTerkunci: [
      'Satu perulangan luar untuk baris, lalu tiga perulangan dalam: spasi, angka naik, angka turun.',
      'Banyaknya spasi di baris ke-i adalah N − i.',
      'Angka turun dimulai dari i − 1, bukan dari i, supaya puncaknya tidak tercetak dua kali.',
    ],
    totalPeserta: 0,
    tags: ['nested-loop', 'pola'],
  },
  {
    id: 'c-07',
    slug: 'bingkai-papan-nama',
    minggu: 7,
    judul: 'Bingkai Papan Nama',
    tanggalRilis: '2026-11-23',
    deadline: '2026-11-29T23:59',
    difficulty: 'SEDANG',
    topik: ['prosedur', 'perulangan'],
    constraints: [
      '1 <= K <= 10',
      '1 <= lebar, tinggi <= 50',
      'Antar bingkai dipisahkan tepat satu baris kosong',
    ],
    sampleIO: [
      {
        input: '1\n5 3',
        output: '#####\n#...#\n#####',
        penjelasan: 'Tepi berupa #, bagian dalam berupa titik.',
      },
      {
        input: '2\n3 3\n1 1',
        output: '###\n#.#\n###\n\n#',
        penjelasan: 'Dua bingkai, dipisahkan satu baris kosong. Bingkai 1 × 1 hanya satu #.',
      },
      {
        input: '1\n4 1',
        output: '####',
        penjelasan: 'Tinggi 1 berarti hanya ada satu baris tepi.',
      },
    ],
    hintTerkunci: [
      'Buat satu prosedur yang mencetak satu baris: karakter tepi, isi sebanyak lebar − 2, lalu tepi lagi.',
      'Bingkai = baris atas, tinggi − 2 baris tengah, baris bawah. Semuanya memanggil prosedur yang sama.',
      'Hati-hati dengan lebar atau tinggi 1: tepi kanan dan baris bawah tidak boleh tercetak dua kali.',
    ],
    totalPeserta: 0,
    tags: ['prosedur', 'pola'],
  },
  {
    id: 'c-08',
    slug: 'tiga-angka-berurutan',
    minggu: 8,
    judul: 'Tiga Angka Berurutan',
    tanggalRilis: '2027-03-01',
    deadline: '2027-03-07T23:59',
    difficulty: 'SEDANG',
    topik: ['prosedur', 'pointer'],
    constraints: [
      '1 <= T <= 100',
      '-1000 <= a, b, c <= 1000',
      'Pertukaran dihitung sesuai urutan perbandingan di soal',
    ],
    sampleIO: [
      {
        input: '3\n3 1 2\n1 2 3\n9 5 1',
        output: '1 2 3 (2 tukar)\n1 2 3 (0 tukar)\n1 5 9 (3 tukar)',
        penjelasan: 'Data yang sudah urut tidak butuh pertukaran. 9 5 1 butuh ketiganya.',
      },
      {
        input: '1\n4 4 2',
        output: '2 4 4 (2 tukar)',
        penjelasan: 'Dua angka yang sama tidak ditukar, karena yang kiri tidak lebih besar.',
      },
    ],
    hintTerkunci: [
      'Prosedur tukar(int a, int b) tidak mengubah apa pun di main. Kirimkan alamatnya: tukar(&a, &b).',
      'Di dalam prosedur, *a adalah isi variabel yang ditunjuk, bukan alamatnya.',
      'Jumlah pertukaran juga bisa dikembalikan lewat parameter keluaran, sama seperti angkanya.',
    ],
    totalPeserta: 0,
    tags: ['parameter-keluaran', 'tukar'],
  },
  {
    id: 'c-09',
    slug: 'prima-di-rentang',
    minggu: 9,
    judul: 'Prima di Rentang',
    tanggalRilis: '2027-03-15',
    deadline: '2027-03-21T23:59',
    difficulty: 'SEDANG',
    topik: ['fungsi', 'perulangan'],
    constraints: [
      '1 <= A <= B <= 100000',
      'Bilangan prima dicetak menaik, dipisahkan satu spasi',
      'Batas waktu 1 detik, batas memori 64 MB',
    ],
    sampleIO: [
      {
        input: '10 30',
        output: '11 13 17 19 23 29\njumlah: 6',
        penjelasan: 'Enam bilangan prima di antara 10 dan 30.',
      },
      {
        input: '1 10',
        output: '2 3 5 7\njumlah: 4',
        penjelasan: '1 bukan bilangan prima.',
      },
      {
        input: '24 28',
        output: '-\njumlah: 0',
        penjelasan: 'Tidak ada prima di rentang ini, jadi baris pertama berisi tanda minus.',
      },
    ],
    hintTerkunci: [
      'Tulis fungsi int prima(int n) yang mengembalikan 1 kalau prima dan 0 kalau bukan.',
      'Cukup coba pembagi dari 2 selama d × d <= n. Kalau tidak ada yang habis membagi, n prima.',
      'Cetak spasi sebelum setiap bilangan kecuali yang pertama, supaya tidak ada spasi berlebih.',
    ],
    totalPeserta: 0,
    tags: ['fungsi', 'prima'],
  },
  {
    id: 'c-10',
    slug: 'suhu-rata-rata-laboratorium',
    minggu: 10,
    judul: 'Suhu Rata-Rata Laboratorium',
    tanggalRilis: '2027-04-26',
    deadline: '2027-05-02T23:59',
    difficulty: 'MUDAH',
    topik: ['array'],
    constraints: [
      '1 <= N <= 1000',
      '-50 <= suhu <= 100',
      'Rata-rata dicetak dengan tepat dua angka di belakang koma',
      'Batas waktu 1 detik, batas memori 64 MB',
    ],
    sampleIO: [
      {
        input: '5\n21 24 23 27 20',
        output: 'rata-rata: 23.00\ntertinggi: 27\nterendah: 20',
        penjelasan: 'Jumlah seluruh suhu 115, dibagi 5 menghasilkan tepat 23.',
      },
      {
        input: '1\n30',
        output: 'rata-rata: 30.00\ntertinggi: 30\nterendah: 30',
        penjelasan: 'Dengan satu data, ketiganya bernilai sama.',
      },
      {
        input: '4\n-3 -1 0 4',
        output: 'rata-rata: 0.00\ntertinggi: 4\nterendah: -3',
        penjelasan: 'Suhu negatif tetap dihitung. Totalnya nol, jadi rata-ratanya nol.',
      },
    ],
    hintTerkunci: [
      'Nilai awal untuk tertinggi dan terendah sebaiknya diambil dari elemen pertama, bukan dari 0.',
      'total / n memakai pembagian bulat. Ubah salah satu operandnya ke double sebelum membagi.',
      'printf("%.2f", x) mencetak dua angka di belakang koma dan sudah membulatkan sendiri.',
    ],
    totalPeserta: 0,
    tags: ['array', 'min-max'],
  },
  {
    id: 'c-11',
    slug: 'ipk-tertinggi-angkatan',
    minggu: 11,
    judul: 'IPK Tertinggi Angkatan',
    tanggalRilis: '2027-05-03',
    deadline: '2027-05-09T23:59',
    difficulty: 'SEDANG',
    topik: ['record'],
    constraints: [
      '1 <= N <= 1000',
      'Nama tanpa spasi, panjang <= 32 karakter',
      'NPM berupa 9 digit',
      '0.00 <= IPK <= 4.00, dengan dua angka di belakang koma',
    ],
    sampleIO: [
      {
        input: '3\nAlya 240711001 3.72\nBimo 240711002 3.85\nCitra 240711003 3.85',
        output: 'Bimo (240711002) 3.85',
        penjelasan: 'Bimo dan Citra seri. Yang dicetak adalah yang lebih dulu muncul.',
      },
      {
        input: '1\nDamar 240711010 2.50',
        output: 'Damar (240711010) 2.50',
        penjelasan: 'Satu mahasiswa otomatis menjadi yang tertinggi.',
      },
    ],
    hintTerkunci: [
      'Satu struct Mahasiswa berisi nama, NPM, dan IPK. NPM lebih aman disimpan sebagai teks.',
      'Tidak perlu menyimpan semua data. Cukup dua variabel struct: yang sedang dibaca dan yang terbaik sejauh ini.',
      'Struct bisa disalin utuh dengan satu penugasan: terbaik = sekarang;',
    ],
    totalPeserta: 0,
    tags: ['struct', 'maksimum'],
  },
  {
    id: 'c-12',
    slug: 'papan-peringkat-kelas',
    minggu: 12,
    judul: 'Papan Peringkat Kelas',
    tanggalRilis: '2027-05-18',
    deadline: '2027-05-23T23:59',
    difficulty: 'SULIT',
    topik: ['array', 'record'],
    constraints: [
      '1 <= N <= 100',
      'Nama tanpa spasi, panjang <= 32 karakter',
      '0 <= nilai <= 100',
      'Urutan: nilai menurun, lalu nama menaik bila seri',
    ],
    sampleIO: [
      {
        input: '4\nNadia 92\nGilang 95\nRangga 92\nIvana 88',
        output: '1. Gilang 95\n2. Nadia 92\n3. Rangga 92\n4. Ivana 88',
        penjelasan: 'Nadia dan Rangga sama-sama 92, jadi urutannya ditentukan secara alfabetis.',
      },
      {
        input: '2\nBimo 70\nAlya 70',
        output: '1. Alya 70\n2. Bimo 70',
        penjelasan: 'Nilainya identik, sehingga seluruh urutan ditentukan oleh nama.',
      },
      {
        input: '1\nDamar 100',
        output: '1. Damar 100',
        penjelasan: 'Satu peserta tetap harus dicetak dengan format peringkat yang sama.',
      },
    ],
    hintTerkunci: [
      'Satu array of struct berisi nama dan nilai jauh lebih aman daripada dua array yang harus dijaga sejajar.',
      'Bubble sort cukup untuk N <= 100: bandingkan dua elemen bersebelahan, tukar kalau urutannya salah.',
      'strcmp(a, b) bernilai positif kalau a seharusnya di belakang b secara alfabetis.',
    ],
    totalPeserta: 0,
    tags: ['array-of-record', 'sorting'],
  },
]
