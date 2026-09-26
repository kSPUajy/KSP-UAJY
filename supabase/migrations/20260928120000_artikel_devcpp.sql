-- Members write C in Dev-C++, whose bundled compiler defaults to the old
-- C90 rules: no declarations inside `for (...)`, no `%zu`. The article
-- examples now follow those rules, and the compiler-errors article reads
-- Dev-C++'s own error panel. Refresh every post body from the seed.

insert into public.news_posts (id, slug, judul, tanggal, kategori, cover, excerpt, penulis, body_mdx, tags) values
  ($ksp$n-14$ksp$, $ksp$kebiasaan-kecil-kode-c-rapi$ksp$, $ksp$Lima Kebiasaan Kecil Supaya Kode C Lebih Rapi$ksp$, $ksp$2026-09-24$ksp$, $ksp$tips$ksp$, $ksp$https://picsum.photos/seed/ksp-artikel-rapi/1200/675$ksp$, $ksp$Kode yang rapi lebih mudah dibaca, lebih mudah diperiksa, dan lebih mudah kamu perbaiki sendiri. Lima kebiasaan kecil yang dampaknya besar.$ksp$, $ksp$Tim KSP$ksp$, $ksp$Kode yang rapi bukan soal gaya-gayaan. Kode yang rapi lebih mudah dibaca, lebih
mudah diperiksa tentor, dan yang paling penting, lebih mudah kamu perbaiki
sendiri saat ada yang salah. Berikut lima kebiasaan kecil yang dampaknya besar.

## 1. Indentasi yang konsisten

Setiap kali masuk ke dalam blok kurung kurawal, geser ke kanan satu tingkat.
Dengan begitu, kamu bisa melihat sekilas bagian mana yang ada di dalam `if` dan
mana yang di dalam perulangan.

```c
for (i = 0; i < n; i++) {
    if (nilai[i] > 70) {
        lulus++;
    }
}
```

Bandingkan kalau semuanya ditulis rata kiri. Mencari kurung yang lupa ditutup
jadi jauh lebih sulit.

## 2. Nama variabel yang menjelaskan isinya

`jumlahMahasiswa` lebih jelas daripada `jm`, apalagi `x`. Nama yang jelas membuat
kode bisa dibaca seperti kalimat, dan kamu tidak perlu mengingat-ingat arti
setiap singkatan. Pengecualiannya adalah variabel penghitung perulangan seperti
`i` dan `j`, yang memang sudah umum dipakai.

## 3. Beri nilai awal pada variabel

Di C, variabel yang dibuat di dalam fungsi tanpa nilai awal isinya acak, bukan
nol.

```c
int total;      // isinya tidak bisa ditebak
int total = 0;  // aman
```

Lupa memberi nilai awal adalah salah satu penyebab paling umum hasil
penjumlahan yang tiba-tiba aneh.

## 4. Komentar untuk menjelaskan "kenapa"

Kode sudah menunjukkan *apa* yang dilakukan. Komentar paling berguna saat
menjelaskan *kenapa* kamu melakukannya:

```c
// dikali 1.0 supaya hasilnya pecahan, bukan pembagian bulat
double rata = total * 1.0 / n;
```

## 5. Biarkan compiler membantumu

Nyalakan `-Wall` supaya compiler memperingatkan hal-hal yang mencurigakan,
misalnya variabel yang dibuat tapi tidak pernah dipakai. Di Dev-C++, buka
**Tools → Compiler Options**, centang **Add the following commands when calling
the compiler**, lalu isi dengan `-Wall`.

Anggap setiap warning sebagai pekerjaan rumah yang harus diselesaikan, bukan
tulisan yang boleh diabaikan.$ksp$, array[$ksp$tips$ksp$, $ksp$pemula$ksp$, $ksp$gaya-kode$ksp$]::text[]),
  ($ksp$n-13$ksp$, $ksp$debugging-pakai-printf$ksp$, $ksp$Debugging Pakai printf: Cara Paling Sederhana Menemukan Bug$ksp$, $ksp$2026-09-20$ksp$, $ksp$tips$ksp$, $ksp$https://picsum.photos/seed/ksp-artikel-debug/1200/675$ksp$, $ksp$Programnya jalan tapi hasilnya salah, dan tidak ada pesan error. Cetak isi variabelnya, dan lihat sendiri apa yang sebenarnya terjadi.$ksp$, $ksp$Tim KSP$ksp$, $ksp$Programmu sudah bisa dikompilasi, tapi hasilnya salah. Tidak ada pesan error, dan
kamu tidak tahu harus mulai dari mana. Di sinilah teknik paling sederhana dan
paling sering dipakai programmer berguna: **mencetak isi variabel untuk melihat
apa yang sebenarnya terjadi.**

## Idenya sederhana

Bug terjadi karena ada perbedaan antara apa yang kamu *kira* dikerjakan program
dan apa yang *benar-benar* dikerjakannya. Dengan menambahkan `printf` di
tempat-tempat penting, kamu bisa melihat langsung nilainya, alih-alih menebak.

## Contoh: jumlah yang salah

Misalnya program ini seharusnya menjumlahkan 1 sampai 5, tapi hasilnya tidak
sesuai harapan:

```c
int i;
int total = 0;
for (i = 1; i < 5; i++) {
    total += i;
}
printf("%d\n", total);
```

Tambahkan satu baris di dalam perulangan:

```c
for (i = 1; i < 5; i++) {
    total += i;
    printf("i = %d, total = %d\n", i, total);
}
```

Keluarannya langsung memperlihatkan masalahnya: `i` berhenti di 4, bukan 5.
Kondisinya seharusnya `i <= 5`.

## Tips supaya lebih efektif

1. **Beri label.** Tulis `printf("i = %d\n", i)`, bukan hanya `printf("%d\n", i)`.
   Kalau ada banyak baris keluaran, kamu tahu mana yang mana.
2. **Cetak sebelum dan sesudah.** Kalau curiga pada satu bagian, cetak nilainya
   sebelum dan sesudah bagian itu. Dari situ kelihatan di mana nilainya mulai
   salah.
3. **Selalu akhiri dengan `\n`.** Keluaran tanpa baris baru kadang tertahan dan
   tidak langsung muncul, apalagi kalau programnya berhenti mendadak.
4. **Persempit sedikit demi sedikit.** Mulai dari beberapa titik, lalu tambah
   `printf` di sekitar bagian yang mencurigakan sampai ketemu baris penyebabnya.

## Jangan lupa dihapus

Setelah bugnya ketemu, hapus lagi semua `printf` tambahan. Kalau programmu
dinilai dari keluarannya, satu baris ekstra saja bisa membuat jawaban yang
sebenarnya benar dianggap salah.$ksp$, array[$ksp$tips$ksp$, $ksp$debugging$ksp$, $ksp$printf$ksp$]::text[]),
  ($ksp$n-12$ksp$, $ksp$trik-printf-yang-jarang-diketahui$ksp$, $ksp$Trik printf yang Jarang Diketahui$ksp$, $ksp$2026-09-16$ksp$, $ksp$tips$ksp$, $ksp$https://picsum.photos/seed/ksp-artikel-printf/1200/675$ksp$, $ksp$Mengatur lebar kolom, mengisi dengan nol, mencetak tanda persen, sampai fakta bahwa printf ternyata mengembalikan nilai.$ksp$, $ksp$Tim KSP$ksp$, $ksp$`printf` adalah fungsi pertama yang dipelajari hampir semua orang. Tapi banyak
yang hanya memakai `%d` dan `%s`, padahal `printf` bisa melakukan jauh lebih
banyak. Berikut beberapa trik yang berguna, terutama untuk soal yang meminta
format keluaran tertentu.

## Mengatur lebar kolom

Angka di antara `%` dan huruf format menentukan lebar minimal:

```c
printf("[%5d]\n", 42);   // [   42]
printf("[%-5d]\n", 42);  // [42   ]
printf("[%05d]\n", 42);  // [00042]
```

- `%5d` menambah spasi di kiri sampai lebarnya 5 karakter.
- `%-5d` sama, tapi rata kiri.
- `%05d` mengisi dengan nol, cocok untuk nomor urut seperti `00042`.

Trik ini sangat membantu saat membuat tabel yang kolomnya harus lurus.

## Membatasi angka di belakang koma

```c
printf("[%.2f]\n", 3.14159);   // [3.14]
printf("[%8.2f]\n", 3.14159);  // [    3.14]
```

`%.2f` mencetak tepat dua angka di belakang koma dan sudah membulatkan sendiri.
Keduanya bisa digabung: `%8.2f` berarti lebar 8, dengan dua angka desimal.

## Mencetak tanda persen

Karena `%` punya arti khusus, untuk mencetak tanda persen yang sebenarnya, tulis
dua kali:

```c
printf("diskon 50%%\n");  // diskon 50%
```

## Lebar kolom dari variabel

Kalau lebarnya baru diketahui saat program berjalan, pakai `*`:

```c
int lebar = 6;
printf("[%*d]\n", lebar, 42);  // [    42]
```

## Bonus: angka dalam bentuk lain

```c
printf("%x %o\n", 255, 8);  // ff 10
printf("%c\n", 65);         // A
```

`%x` mencetak bilangan heksadesimal, `%o` oktal, dan `%c` mencetak karakter
dari kode ASCII-nya. Ternyata huruf `A` di komputer disimpan sebagai angka 65.

## `printf` juga mengembalikan nilai

Jarang ada yang tahu bahwa `printf` mengembalikan jumlah karakter yang dicetak:

```c
int n = printf("halo\n");
printf("%d\n", n);  // 5
```

Hasilnya 5: empat huruf ditambah satu karakter baris baru.$ksp$, array[$ksp$tips$ksp$, $ksp$printf$ksp$, $ksp$format$ksp$]::text[]),
  ($ksp$n-11$ksp$, $ksp$membaca-pesan-error-compiler$ksp$, $ksp$Membaca Pesan Error Compiler Tanpa Panik$ksp$, $ksp$2026-09-12$ksp$, $ksp$tips$ksp$, $ksp$https://picsum.photos/seed/ksp-artikel-error/1200/675$ksp$, $ksp$Pesan error itu teman: compiler memberi tahu letak masalahnya. Begini cara membacanya di Dev-C++, termasuk error for loop yang sering bikin bingung.$ksp$, $ksp$Tim KSP$ksp$, $ksp$Pertama kali melihat daftar pesan error itu menakutkan. Tapi pesan error
sebenarnya adalah teman: compiler sedang memberi tahu di mana masalahnya. Kamu
hanya perlu tahu cara membacanya. Contoh di artikel ini memakai Dev-C++, aplikasi
yang dipakai di kelas.

## Di mana pesan error muncul

Saat kamu menekan **Compile** (F9) dan ada yang salah, Dev-C++ membuka tab
**Compiler** di bagian bawah jendela. Isinya tabel dengan empat kolom:

| Line | Col | File | Message |
| --- | --- | --- | --- |
| 5 | 5 | galat.c | [Error] expected ';' before 'return' |

- **Line** adalah nomor baris tempat masalahnya ditemukan.
- **Col** adalah posisi kolomnya di baris itu.
- **Message** adalah penjelasannya. Awalan `[Error]` artinya program tidak bisa
  dijalankan sampai ini diperbaiki.

Klik dua kali baris pesannya, dan Dev-C++ langsung melompat ke baris kode yang
bermasalah.

## Tiga pesan yang paling sering muncul

**Lupa titik koma**

```c
printf("%d\n", jumlah)
return 0;
```

Pesannya: `expected ';' before 'return'`. Compiler baru sadar ada yang kurang saat
bertemu `return`, jadi baris yang ditunjuk sering kali baris *setelah* kesalahan
yang sebenarnya.

**Salah ketik nama variabel**

```c
int jumlah = 0;
printf("%d\n", jumlh);
```

Pesannya: `'jumlh' undeclared (first use in this function)`. Artinya nama
`jumlh` belum pernah dibuat. Periksa ejaannya, atau pastikan variabelnya sudah
dideklarasikan di atas.

**Deklarasi di dalam `for`**

```c
for (int i = 0; i < 5; i++) {
```

Pesannya: `'for' loop initial declarations are only allowed in C99 or C11 mode`.
Ini khas Dev-C++, yang secara bawaan memakai aturan C versi lama. Perbaikannya
mudah: deklarasikan variabelnya di luar `for`.

```c
int i;
for (i = 0; i < 5; i++) {
```

## Error dan warning itu berbeda

**Error** membuat program gagal dikompilasi. **Warning** (awalan `[Warning]`)
tidak menghentikan kompilasi, tapi hampir selalu menandakan ada yang salah.
Contoh paling klasik adalah lupa tanda `&` di `scanf`:

```c
scanf("%d", umur);
```

```
[Warning] format '%d' expects argument of type 'int *', but argument 2 has type 'int'
```

Program ini tetap bisa dijalankan, tapi hasilnya kacau atau langsung berhenti.
Supaya warning penting seperti ini selalu muncul, nyalakan `-Wall` di Dev-C++:
buka **Tools → Compiler Options**, centang **Add the following commands when
calling the compiler**, lalu isi dengan `-Wall`.

## Tiga kebiasaan yang membantu

1. **Perbaiki error pertama dulu.** Satu kesalahan bisa memicu banyak error lain
   di bawahnya. Sering kali, setelah error pertama diperbaiki, sisanya ikut hilang.
2. **Lihat juga baris sebelumnya.** Kalau baris yang ditunjuk terlihat benar,
   kesalahannya mungkin ada di baris tepat di atasnya.
3. **Kompilasi sesering mungkin.** Menulis lima baris lalu kompilasi jauh lebih
   mudah daripada menulis seratus baris lalu menghadapi dua puluh error sekaligus.$ksp$, array[$ksp$tips$ksp$, $ksp$compiler$ksp$, $ksp$pemula$ksp$]::text[]),
  ($ksp$n-10$ksp$, $ksp$fakta-unik-bahasa-c$ksp$, $ksp$Tujuh Fakta Unik tentang Bahasa C$ksp$, $ksp$2026-09-08$ksp$, $ksp$fakta$ksp$, $ksp$https://picsum.photos/seed/ksp-artikel-fakta/1200/675$ksp$, $ksp$Dari asal-usul namanya, program "Hello, world!" pertama, sampai keunikan kecil yang bikin programmer berpengalaman pun kaget.$ksp$, $ksp$Tim KSP$ksp$, $ksp$Di balik kesannya yang serius, bahasa C punya banyak cerita dan keunikan kecil.
Berikut tujuh di antaranya.

## 1. Namanya diambil dari huruf sebelumnya

C adalah penerus bahasa bernama **B**, buatan Ken Thompson di Bell Labs. B sendiri
turunan dari bahasa BCPL. Jadi nama C bukan singkatan apa-apa, hanya huruf
berikutnya setelah B.

## 2. "Hello, world!" dipopulerkan oleh buku C

Program pertama yang hampir semua orang tulis, yaitu mencetak `Hello, world!`,
dipopulerkan oleh buku *The C Programming Language* karya Brian Kernighan dan
Dennis Ritchie yang terbit tahun 1978. Sejak itu, hampir setiap tutorial bahasa
pemrograman dimulai dengan cara yang sama.

## 3. Kata kuncinya sedikit sekali

Standar C yang pertama (C89) hanya punya **32 kata kunci**, seperti `int`, `if`,
`for`, dan `return`. Bandingkan dengan bahasa modern yang bisa punya jauh lebih
banyak. C memang sengaja dibuat kecil.

## 4. `a[2]` sama dengan `2[a]`

Ini keunikan yang sering bikin orang kaget. Coba jalankan:

```c
int a[3] = {10, 20, 30};
printf("%d %d\n", a[2], 2[a]);
```

Keluarannya `30 30`. Di balik layar, C membaca `a[2]` sebagai "ambil nilai di
posisi a ditambah 2", dan penjumlahan bisa dibalik urutannya. Tentu saja, jangan
menulis seperti ini di tugasmu. Ini hanya fakta menarik.

## 5. `sizeof` bukan fungsi

`sizeof` terlihat seperti fungsi karena sering ditulis dengan kurung, tapi
sebenarnya ia operator, sama seperti `+` atau `*`. Untuk variabel, kurungnya
boleh tidak ditulis:

```c
int x = 5;
int ukuran = sizeof x;
printf("%d\n", ukuran);
```

## 6. C terus diperbarui

C bukan bahasa yang berhenti di tahun 1970-an. Standarnya terus diperbarui:
C89, C99, C11, C17, dan yang terbaru C23. Setiap versi menambahkan fitur baru
sambil tetap menjaga kode lama supaya masih bisa berjalan.

## 7. `return 0` di akhir `main` punya arti

Angka yang dikembalikan `main` dikirim ke sistem operasi. Angka `0` berarti
"program selesai dengan baik", sedangkan angka lain biasanya berarti ada masalah.
Sejak C99, kalau `main` selesai tanpa `return`, C otomatis menganggapnya
mengembalikan `0`.$ksp$, array[$ksp$fakta$ksp$, $ksp$sejarah$ksp$, $ksp$bahasa-c$ksp$]::text[]),
  ($ksp$n-09$ksp$, $ksp$kenapa-bahasa-c-masih-dipakai$ksp$, $ksp$Kenapa Bahasa C Masih Dipakai Sampai Sekarang$ksp$, $ksp$2026-09-02$ksp$, $ksp$fakta$ksp$, $ksp$https://picsum.photos/seed/ksp-artikel-kenapa-c/1200/675$ksp$, $ksp$Umurnya sudah lebih dari lima puluh tahun, tapi C masih ada di Linux, Python, sampai mesin cuci. Ini alasannya.$ksp$, $ksp$Tim KSP$ksp$, $ksp$Umur bahasa C sudah lebih dari lima puluh tahun. Di dunia teknologi, itu setara
dengan zaman purba. Tapi sampai hari ini C masih diajarkan di hampir setiap
jurusan informatika, dan masih dipakai untuk membangun perangkat lunak yang kamu
pakai setiap hari. Kenapa bisa begitu?

## Lahir untuk membangun sistem operasi

C dibuat oleh Dennis Ritchie di Bell Labs pada awal 1970-an. Tujuannya sangat
praktis: menulis ulang sistem operasi Unix supaya tidak perlu ditulis dalam
bahasa mesin yang berbeda-beda untuk setiap komputer.

Hasilnya, C menjadi bahasa yang dekat dengan cara kerja komputer, tapi tetap bisa
dibaca manusia. Kombinasi itulah yang membuatnya bertahan.

## Diam-diam ada di mana-mana

Banyak perangkat lunak besar yang kamu kenal ditulis dengan C, atau punya inti
yang ditulis dengan C:

- **Linux**, sistem operasi yang menjalankan sebagian besar server di internet
  dan menjadi dasar Android, intinya ditulis dengan C.
- **Python**, bahasa yang terkenal mudah dipelajari, dijalankan oleh program yang
  juga ditulis dengan C.
- **Git**, alat yang dipakai hampir semua programmer untuk menyimpan riwayat kode.
- **SQLite**, database kecil yang ada di hampir setiap ponsel.
- Program di dalam **mesin cuci, remote AC, sampai kendaraan** banyak yang
  ditulis dengan C, karena C bisa berjalan di perangkat dengan memori yang sangat
  kecil.

## Pintu masuk ke bahasa lain

Kalau kamu sudah paham C, bahasa lain akan terasa familier. C++, Java, C#,
JavaScript, dan banyak bahasa lain meminjam gaya penulisan C: kurung kurawal untuk
blok kode, titik koma di akhir perintah, dan bentuk perulangan `for` yang sama.

## Mengajarkan cara komputer berpikir

Bahasa yang lebih modern banyak mengerjakan hal secara otomatis di belakang
layar. Itu memudahkan, tapi juga menyembunyikan cara kerjanya. C tidak
menyembunyikan banyak hal. Kamu harus menentukan sendiri tipe data setiap
variabel, dan memikirkan langkah demi langkah apa yang dikerjakan program.

Karena itu, belajar C memang terasa lebih menantang di awal. Tapi pemahaman yang
kamu dapat akan terbawa ke bahasa apa pun yang kamu pelajari sesudahnya.$ksp$, array[$ksp$fakta$ksp$, $ksp$sejarah$ksp$, $ksp$bahasa-c$ksp$]::text[]),
  ($ksp$n-06$ksp$, $ksp$bahaya-scanf-persen-s$ksp$, $ksp$Berhenti Menulis scanf Persen-s Tanpa Batas Lebar$ksp$, $ksp$2026-08-30$ksp$, $ksp$tutorial$ksp$, $ksp$https://picsum.photos/seed/ksp-berita-scanf/1200/675$ksp$, $ksp$Satu baris yang sering muncul di program pemula, dan hampir selalu menyimpan masalah. Perbaikannya cuma satu angka, dan angkanya bukan yang kamu kira.$ksp$, $ksp$Tim KSP$ksp$, $ksp$Ada satu baris yang sering sekali muncul di program pemula, dan hampir selalu
menyimpan masalah:

```c
char nama[32];
scanf("%s", nama);
```

Baris ini membaca satu kata dari masukan ke dalam `nama`. Masalahnya, `scanf`
tidak tahu bahwa `nama` hanya punya ruang 32 byte. Kalau masukannya lebih panjang,
`scanf` tetap menulis, melewati ujung array, ke memori yang bukan miliknya.

## Kenapa ini tidak ketahuan saat diuji

Karena saat diuji, kamu mengetik nama yang pendek.

Buffer overflow tidak selalu membuat program berhenti. Yang tertimpa mungkin
variabel lain di stack, dan programnya tetap jalan dengan nilai yang diam-diam
berubah. Atau yang tertimpa adalah bagian yang belum dipakai, dan tidak terjadi
apa-apa sama sekali.

Kelas kesalahan inilah yang selama puluhan tahun jadi sumber kerentanan keamanan
paling umum di perangkat lunak yang ditulis dengan C.

## Perbaikannya satu angka

`scanf` menerima batas lebar tepat setelah tanda persen:

```c
char nama[32];
scanf("%31s", nama);
```

Angkanya 31, bukan 32. `scanf` menambahkan karakter nol di akhir, dan karakter itu
juga butuh tempat. Aturannya: **selalu satu kurang dari ukuran array.**

Ini yang paling sering meleset satu. Kalau kamu menulis `%32s` pada array
berukuran 32, kamu baru saja menggeser masalahnya satu byte, bukan
menghilangkannya.

## Untuk membaca satu baris penuh

`%s` berhenti di spasi pertama, jadi ia tidak bisa membaca kalimat. Untuk itu
pakai `fgets`, yang menerima ukuran buffer sebagai argumen:

```c
char baris[256];
if (fgets(baris, sizeof baris, stdin) == NULL) {
    return 1;
}
```

Perhatikan bahwa `fgets` ikut menyimpan karakter baris baru kalau muat. Untuk
sebagian besar soal, hal itu perlu dibuang sendiri.

## Kebiasaan yang layak dibawa

Setiap kali kamu menulis `%s` di dalam `scanf`, berhenti sebentar dan tanyakan
berapa ukuran tujuannya. Kalau kamu tidak bisa menjawabnya langsung, itu tanda
bahwa batasnya memang belum kamu pikirkan.$ksp$, array[$ksp$string$ksp$, $ksp$tutorial$ksp$, $ksp$keamanan$ksp$]::text[]),
  ($ksp$n-01$ksp$, $ksp$pendaftaran-anggota-baru-2026$ksp$, $ksp$Pendaftaran Anggota Baru Semester Ganjil 2026/2027 Dibuka$ksp$, $ksp$2026-08-24$ksp$, $ksp$pengumuman$ksp$, $ksp$https://picsum.photos/seed/ksp-berita-pendaftaran/1200/675$ksp$, $ksp$Terbuka untuk mahasiswa aktif UAJY semester 1 sebagai persiapan mata kuliah dasar pemrograman C, tanpa syarat kemampuan awal. Biaya Rp150.000 dengan cashback 70%.$ksp$, $ksp$Pengurus KSP$ksp$, $ksp$Pendaftaran anggota baru Kelompok Studi Pemrograman untuk semester ganjil
2026/2027 dibuka mulai hari ini sampai 11 September 2026. Pendaftaran terbuka
untuk mahasiswa aktif UAJY semester 1, tanpa syarat kemampuan awal.

## Persiapan untuk mata kuliah dasar pemrograman

Kelas KSP disusun untuk mempersiapkanmu menghadapi mata kuliah dasar pemrograman
berbahasa C. Materinya berjalan bertahap setiap minggu: dimulai dari flowchart,
lalu tipe data, pemilihan, perulangan, prosedur, fungsi, array, sampai record.

Belum pernah menulis satu baris kode pun? Tidak masalah. Kelasnya dimulai dari
nol, dengan tentor yang mendampingi dari pertemuan pertama.

## Apa yang kamu dapat

- Kelas rutin setiap Senin dan Selasa, 19.00–21.00 WIB, di Lab Komputasi
- Pendampingan dari tentor di setiap pertemuan
- Challenge mingguan yang mengikuti materi kelas
- Akses ke arsip modul dan soal latihan
- Sertifikat keanggotaan di akhir tahun ajaran, bisa ditukar SPAMA tipe organisasi

## Biaya

Biaya pendaftaran Rp150.000, dibayar sekali. Kalau presensimu memenuhi, 70%
(Rp105.000) dikembalikan sebagai cashback. Tidak ada iuran bulanan.

## Cara mendaftar

Isi formulir pendaftaran lewat tombol daftar di halaman gabung. Informasi lengkap
tentang syarat, alur, dan pertanyaan yang sering diajukan ada di sana juga.$ksp$, array[$ksp$pendaftaran$ksp$, $ksp$anggota-baru$ksp$, $ksp$kelas$ksp$]::text[])
on conflict (id) do update set
  judul = excluded.judul,
  excerpt = excluded.excerpt,
  body_mdx = excluded.body_mdx,
  tags = excluded.tags,
  updated_at = now();
