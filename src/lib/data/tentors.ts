import 'server-only'

import type { Tentor } from '@/lib/types'

/**
 * Tentor metadata. The C in `favoriteSnippet` is not here — it lives in
 * `src/content/snippets/<slug>.c` and the accessor loads it, exactly like the
 * MDX bodies. That keeps every snippet a real, compilable file.
 */
export type TentorSource = Omit<Tentor, 'favoriteSnippet'> & {
  favoriteSnippet: { judul: string }
}

const portrait = (seed: string): string => `https://picsum.photos/seed/${seed}/640/800`

export const tentorSources: readonly TentorSource[] = [
  {
    id: 't-01',
    nama: 'Reza Maulana Hakim',
    slug: 'reza-maulana-hakim',
    foto: portrait('ksp-tentor-reza'),
    keahlian: ['pointer', 'manajemen memori', 'debugging', 'gdb'],
    mataKuliahBinaan: ['Algoritma dan Pemrograman', 'Praktikum Algoritma dan Pemrograman'],
    angkatan: 2023,
    quote: 'Pointer itu bukan hal sulit. Yang sulit adalah menerima bahwa kamu harus tahu persis siapa yang memiliki memori itu.',
    bio: 'Kepala Divisi Akademik sekaligus tentor tetap kelas pointer dan manajemen memori. Menyusun ulang silabus C dari nol pada 2025 setelah menyadari sebagian besar peserta bisa menulis program yang jalan, tapi tidak bisa menjelaskan kenapa jalan. Kelasnya selalu dimulai dari menggambar kotak dan panah di papan, bukan dari kode.',
    pengalaman: [
      { tahun: '2024', judul: 'Asisten Praktikum Algoritma dan Pemrograman', deskripsi: 'Mendampingi dua kelas praktikum, total 64 mahasiswa, selama satu semester penuh.' },
      { tahun: '2025', judul: 'Penyusun kurikulum C KSP', deskripsi: 'Merancang alur belajar 14 pertemuan dari sintaks dasar sampai alokasi dinamis dan debugging.' },
      { tahun: '2026', judul: 'Pemateri workshop manajemen memori', deskripsi: 'Workshop tiga jam tentang malloc, free, dan menelusuri kebocoran memori dengan valgrind.' },
    ],
    socials: { github: 'https://github.com/rezamh', linkedin: 'https://linkedin.com/in/rezamaulanahakim' },
    favoriteSnippet: { judul: 'Menukar dua nilai lewat alamatnya' },
  },
  {
    id: 't-02',
    nama: 'Gilang Prasetyo Nugroho',
    slug: 'gilang-prasetyo-nugroho',
    foto: portrait('ksp-tentor-gilang'),
    keahlian: ['struktur data', 'linked list', 'competitive programming'],
    mataKuliahBinaan: ['Struktur Data', 'Praktikum Struktur Data'],
    angkatan: 2024,
    quote: 'Linked list itu latihan kepercayaan. Kamu harus percaya bahwa simpan dulu pointer berikutnya sebelum mengubah apa pun.',
    bio: 'Tentor tetap sesi struktur data dan satu-satunya orang di KSP yang menggambar linked list tanpa mengangkat spidol. Rutin mengikuti kontes pemrograman daring dan membawa soal-soal yang menarik kembali ke kelas sebagai bahan latihan mingguan.',
    pengalaman: [
      { tahun: '2025', judul: 'Tentor kelas Struktur Data KSP', deskripsi: 'Memegang delapan pertemuan tentang linked list, stack, queue, dan pohon biner.' },
      { tahun: '2025', judul: 'Peserta Kompetisi Pemrograman Nasional', deskripsi: 'Masuk 40 besar babak penyisihan daring bersama tim FTI UAJY.' },
      { tahun: '2026', judul: 'Penyusun soal challenge mingguan', deskripsi: 'Menulis dan menguji dua belas soal challenge, termasuk dua bertingkat SEGFAULT.' },
    ],
    socials: { github: 'https://github.com/gilangpn' },
    favoriteSnippet: { judul: 'Pencarian biner yang tidak overflow' },
  },
  {
    id: 't-03',
    nama: 'Clarissa Dewi Anggraini',
    slug: 'clarissa-dewi-anggraini',
    foto: portrait('ksp-tentor-clarissa'),
    keahlian: ['algoritma dasar', 'analisis kompleksitas', 'pengajaran'],
    mataKuliahBinaan: ['Algoritma dan Pemrograman', 'Analisis dan Desain Algoritma'],
    angkatan: 2023,
    quote: 'Kalau kamu belum bisa menjelaskan kenapa loop-nya berhenti, kamu belum selesai menulis loop-nya.',
    bio: 'Wakil Ketua dan tentor kelas pemula. Fokusnya membuat peserta terbiasa membaca kode sebelum menulis kode. Terkenal karena meminta setiap orang menjelaskan program temannya dengan kata-kata sendiri sebelum boleh menyentuh papan ketik.',
    pengalaman: [
      { tahun: '2024', judul: 'Asisten Praktikum Algoritma dan Pemrograman', deskripsi: 'Dua semester berturut-turut, dengan fokus pada pendampingan mahasiswa yang mengulang.' },
      { tahun: '2025', judul: 'Koordinator kelas pemula KSP', deskripsi: 'Merancang jalur enam pertemuan untuk peserta yang belum pernah menulis satu baris kode pun.' },
    ],
    socials: { github: 'https://github.com/clarissada', linkedin: 'https://linkedin.com/in/clarissa-dewi-anggraini' },
    favoriteSnippet: { judul: 'Membalik string di tempat' },
  },
  {
    id: 't-04',
    nama: 'Bimo Santoso Aji',
    slug: 'bimo-santoso-aji',
    foto: portrait('ksp-tentor-bimo'),
    keahlian: ['sistem operasi', 'file I/O', 'pemrograman sistem', 'Linux'],
    mataKuliahBinaan: ['Sistem Operasi', 'Organisasi dan Arsitektur Komputer'],
    angkatan: 2022,
    quote: 'Setiap fungsi yang menyentuh dunia luar bisa gagal. fopen bisa gagal. Periksa hasilnya.',
    bio: 'Angkatan paling senior yang masih aktif mengajar. Sehari-hari bekerja paruh waktu sebagai asisten laboratorium jaringan, dan membawa kebiasaan itu ke kelas: selalu memeriksa nilai kembalian, selalu membaca pesan galat sampai habis. Sesi file I/O-nya jadi materi wajib sebelum peserta boleh mengambil challenge bertingkat SULIT.',
    pengalaman: [
      { tahun: '2023', judul: 'Asisten Laboratorium Jaringan Komputer', deskripsi: 'Mengelola praktikum jaringan dan konfigurasi mesin laboratorium FTI.' },
      { tahun: '2024', judul: 'Pemateri seri Pemrograman Sistem', deskripsi: 'Empat pertemuan tentang berkas, proses, dan bagaimana program berbicara dengan sistem operasi.' },
      { tahun: '2026', judul: 'Tentor senior KSP', deskripsi: 'Pendamping tetap untuk challenge yang menyentuh file I/O dan penanganan galat.' },
    ],
    socials: { github: 'https://github.com/bimosa', linkedin: 'https://linkedin.com/in/bimosantosoaji' },
    favoriteSnippet: { judul: 'Membaca berkas baris per baris dengan aman' },
  },
  {
    id: 't-05',
    nama: 'Melati Kusumaningrum',
    slug: 'melati-kusumaningrum',
    foto: portrait('ksp-tentor-melati'),
    keahlian: ['manipulasi string', 'parsing', 'pengujian'],
    mataKuliahBinaan: ['Algoritma dan Pemrograman', 'Pemrograman Berorientasi Objek'],
    angkatan: 2022,
    quote: 'String di C itu array yang kebetulan punya nol di ujungnya. Begitu kamu lupa nol itu, program kamu berhenti jadi milikmu.',
    bio: 'Tentor kelas string dan parsing. Menyusun kumpulan kasus uji yang sekarang dipakai untuk semua challenge mingguan, termasuk kasus-kasus tepi yang dulu sering meloloskan solusi salah. Sedang menyelesaikan skripsi tentang analisis statis untuk kode mahasiswa.',
    pengalaman: [
      { tahun: '2024', judul: 'Penyusun kasus uji challenge KSP', deskripsi: 'Membangun kumpulan kasus uji termasuk masukan kosong, batas atas, dan karakter tak terduga.' },
      { tahun: '2025', judul: 'Tentor kelas manipulasi string', deskripsi: 'Enam pertemuan tentang array karakter, terminator nol, dan fungsi string pustaka standar.' },
    ],
    socials: { github: 'https://github.com/melatikn' },
    favoriteSnippet: { judul: 'Memecah kalimat jadi kata tanpa strtok' },
  },
  {
    id: 't-06',
    nama: 'Yosafat Arka Nugraha',
    slug: 'yosafat-arka-nugraha',
    foto: portrait('ksp-tentor-yosafat'),
    keahlian: ['operasi bitwise', 'optimasi', 'representasi bilangan'],
    mataKuliahBinaan: ['Organisasi dan Arsitektur Komputer'],
    angkatan: 2023,
    quote: 'Bitwise itu bukan sihir. Itu cuma cara melihat angka sebagai barisan sakelar.',
    bio: 'Tentor untuk materi bitwise dan representasi bilangan. Mulai tertarik setelah tugas kuliah menuntut ia memampatkan data ke dalam satu bilangan bulat, dan sejak itu mengumpulkan trik-trik bit sebagai hobi. Kelasnya selalu dibuka dengan satu soal yang kelihatan mustahil sampai kamu melihat binernya.',
    pengalaman: [
      { tahun: '2025', judul: 'Pemateri sesi Operasi Bitwise', deskripsi: 'Tiga pertemuan tentang masker bit, pergeseran, dan penggunaan praktisnya.' },
      { tahun: '2026', judul: 'Penyusun challenge bertingkat SEGFAULT', deskripsi: 'Menulis soal minggu kesebelas tentang pemampatan status ke dalam satu bilangan 32 bit.' },
    ],
    socials: { github: 'https://github.com/yosafatarka' },
    favoriteSnippet: { judul: 'Menghitung bit menyala dengan trik Kernighan' },
  },
  {
    id: 't-07',
    nama: 'Priscilla Hartanto',
    slug: 'priscilla-hartanto',
    foto: portrait('ksp-tentor-priscilla'),
    keahlian: ['struct', 'pengorganisasian data', 'qsort', 'desain API'],
    mataKuliahBinaan: ['Struktur Data', 'Basis Data'],
    angkatan: 2022,
    quote: 'Kalau kamu butuh lima array paralel, yang kamu butuhkan sebenarnya satu struct.',
    bio: 'Tentor kelas struct dan pengorganisasian data. Latar belakangnya basis data, dan ia membawa cara pandang itu ke C: data yang berhubungan harus tinggal bersama. Banyak peserta menyebut kelasnya sebagai titik ketika kode mereka mulai terasa rapi.',
    pengalaman: [
      { tahun: '2024', judul: 'Asisten Praktikum Basis Data', deskripsi: 'Mendampingi perancangan skema dan normalisasi untuk tiga kelas praktikum.' },
      { tahun: '2025', judul: 'Tentor kelas struct dan pengurutan', deskripsi: 'Lima pertemuan tentang struct, array of struct, dan qsort dengan pembanding sendiri.' },
    ],
    socials: { github: 'https://github.com/priscillah', linkedin: 'https://linkedin.com/in/priscillahartanto' },
    favoriteSnippet: { judul: 'Mengurutkan struct dengan dua kunci' },
  },
  {
    id: 't-08',
    nama: 'Dimas Arya Pratama',
    slug: 'dimas-arya-pratama',
    foto: portrait('ksp-tentor-dimas'),
    keahlian: ['rekursi', 'divide and conquer', 'penelusuran'],
    mataKuliahBinaan: ['Analisis dan Desain Algoritma'],
    angkatan: 2023,
    quote: 'Rekursi berhenti kalau kamu menuliskan kasus dasarnya lebih dulu. Selalu tulis kasus dasar lebih dulu.',
    bio: 'Tentor materi rekursi dan divide and conquer. Punya kebiasaan meminta peserta menggambar pohon pemanggilan di kertas sebelum menyentuh papan ketik, karena menurutnya sebagian besar bug rekursi lahir dari orang yang tidak tahu fungsinya dipanggil berapa kali.',
    pengalaman: [
      { tahun: '2025', judul: 'Tentor kelas rekursi KSP', deskripsi: 'Empat pertemuan dari faktorial sampai merge sort, semuanya digambar dulu di kertas.' },
      { tahun: '2026', judul: 'Pendamping proyek akhir', deskripsi: 'Membimbing tiga kelompok proyek akhir, termasuk penyunting teks berbasis terminal.' },
    ],
    socials: { github: 'https://github.com/dimasaryap' },
    favoriteSnippet: { judul: 'Menara Hanoi dalam tujuh baris' },
  },
]
