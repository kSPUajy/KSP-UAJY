-- The first season's challenges were written before the class schedule and
-- asked for pointers and linked lists in week two. Replace them with one
-- challenge per module (Tipe Data to Array of Record), released the Monday
-- each module starts. Their winners go with them.

delete from public.winners;
delete from public.challenges;

insert into public.challenges (id, slug, minggu, judul, tanggal_rilis, deadline, difficulty, topik, deskripsi_mdx, constraints, sample_io, hint_terkunci, total_peserta, tags) values
  ($ksp$c-03$ksp$, $ksp$durasi-praktikum$ksp$, 3, $ksp$Durasi Praktikum$ksp$, $ksp$2026-10-05$ksp$, $ksp$2026-10-11T23:59$ksp$, $ksp$MUDAH$ksp$, array[$ksp$tipe-data$ksp$]::text[], $ksp$Server praktikum mencatat lama setiap sesi dalam satuan detik. Angka seperti
`7384` memang tepat, tapi tidak ada yang bisa membacanya sekilas. Koordinator
lab ingin angka itu ditampilkan dalam jam, menit, dan detik.

Tugasmu menulis program yang membaca lama sesi dalam detik, lalu mencetaknya
dalam format yang mudah dibaca.

## Format masukan

Satu bilangan bulat `N`, lama sesi dalam detik.

## Format keluaran

Satu baris dengan format persis seperti ini:

```
J jam M menit D detik
```

`M` dan `D` selalu di antara 0 dan 59. `J` boleh lebih dari 23.

## Catatan

Soal ini cukup diselesaikan dengan variabel, `scanf`, `printf`, dan operator
aritmetika. Tidak perlu `if` ataupun perulangan.$ksp$, array[$ksp$0 <= N <= 1000000$ksp$, $ksp$Keluaran persis satu baris$ksp$, $ksp$Batas waktu 1 detik, batas memori 64 MB$ksp$]::text[], $ksp$[{"input":"7384","output":"2 jam 3 menit 4 detik","penjelasan":"7384 detik = 2 × 3600 + 3 × 60 + 4."},{"input":"59","output":"0 jam 0 menit 59 detik","penjelasan":"Kurang dari satu menit, jam dan menitnya tetap dicetak sebagai 0."},{"input":"86400","output":"24 jam 0 menit 0 detik","penjelasan":"Satu hari penuh. Jam tidak dibatasi sampai 23."}]$ksp$::jsonb, array[$ksp$Satu jam sama dengan 3600 detik, satu menit 60 detik.$ksp$, $ksp$Operator / pada dua bilangan bulat membuang sisanya. Operator % justru mengambil sisanya.$ksp$, $ksp$Setelah jam diambil, sisa detiknya adalah N % 3600. Dari sisa itu baru hitung menitnya.$ksp$]::text[], 0, array[$ksp$pemanasan$ksp$, $ksp$aritmetika$ksp$]::text[]),
  ($ksp$c-04$ksp$, $ksp$nilai-akhir-semester$ksp$, 4, $ksp$Nilai Akhir Semester$ksp$, $ksp$2026-11-02$ksp$, $ksp$2026-11-08T23:59$ksp$, $ksp$MUDAH$ksp$, array[$ksp$pemilihan$ksp$]::text[], $ksp$Di akhir semester, setiap dosen menghitung nilai akhir dari tiga komponen:
tugas, UTS, dan UAS. Bobotnya 30%, 30%, dan 40%. Setelah itu nilai akhir
diubah menjadi nilai huruf.

Tugasmu menulis program yang melakukan keduanya — sekaligus menolak nilai yang
jelas salah ketik.

## Format masukan

Satu baris berisi tiga bilangan bulat: nilai tugas, UTS, dan UAS.

## Format keluaran

Kalau salah satu nilai di bawah 0 atau di atas 100, cetak:

```
nilai tidak valid
```

Kalau semua valid, cetak dua baris:

```
nilai akhir: X.XX
huruf: H
```

Nilai akhir dihitung sebagai `(3 × tugas + 3 × UTS + 4 × UAS) / 10`.

## Tabel huruf

| Nilai akhir | Huruf |
| --- | --- |
| 85 ke atas | A |
| 70 sampai di bawah 85 | B |
| 55 sampai di bawah 70 | C |
| 40 sampai di bawah 55 | D |
| di bawah 40 | E |$ksp$, array[$ksp$Ketiga nilai berupa bilangan bulat$ksp$, $ksp$Nilai di luar 0 sampai 100 dianggap tidak valid$ksp$, $ksp$Nilai akhir dicetak dengan tepat dua angka di belakang koma$ksp$]::text[], $ksp$[{"input":"80 75 90","output":"nilai akhir: 82.50\nhuruf: B","penjelasan":"(3 × 80 + 3 × 75 + 4 × 90) / 10 = 82.5, masuk rentang B."},{"input":"85 85 85","output":"nilai akhir: 85.00\nhuruf: A","penjelasan":"Tepat di batas bawah A tetap mendapat A."},{"input":"100 101 90","output":"nilai tidak valid","penjelasan":"Nilai UTS 101 di luar rentang, jadi tidak ada yang dihitung."}]$ksp$::jsonb, array[$ksp$Periksa validitas dulu. Kalau satu saja tidak valid, cetak pesannya dan selesai.$ksp$, $ksp$Urutkan pemeriksaan huruf dari batas tertinggi ke terendah dengan if – else if.$ksp$, $ksp$Bandingkan 3 × tugas + 3 × UTS + 4 × UAS dengan 850, 700, dan seterusnya supaya batasnya tidak meleset karena pecahan.$ksp$]::text[], 0, array[$ksp$if-else$ksp$, $ksp$nilai$ksp$]::text[]),
  ($ksp$c-05$ksp$, $ksp$tabungan-kas-kelas$ksp$, 5, $ksp$Tabungan Kas Kelas$ksp$, $ksp$2026-11-09$ksp$, $ksp$2026-11-15T23:59$ksp$, $ksp$MUDAH$ksp$, array[$ksp$perulangan$ksp$]::text[], $ksp$Kelas kita menabung untuk acara akhir semester. Setiap minggu bendahara
mencatat berapa yang masuk ke kas, dan setiap minggu pula ada yang bertanya:
"Sudah cukup belum?"

Tugasmu menulis program yang menjumlahkan semua setoran dan memberi tahu di
minggu ke berapa target pertama kali tercapai.

## Format masukan

Baris pertama berisi dua bilangan bulat: `N`, banyaknya minggu, dan `T`, target
tabungan.
Baris kedua berisi `N` bilangan bulat, setoran tiap minggu secara berurutan.

## Format keluaran

Baris pertama:

```
total: X
```

Baris kedua, kalau total pernah mencapai `T` atau lebih:

```
target tercapai di minggu ke-K
```

dengan `K` adalah minggu pertama saat total sementara sudah mencapai `T`.
Kalau sampai minggu terakhir target tidak tercapai:

```
target belum tercapai, kurang S
```

dengan `S` adalah selisih antara target dan total.$ksp$, array[$ksp$1 <= N <= 100$ksp$, $ksp$0 <= T <= 10000000$ksp$, $ksp$0 <= setoran <= 100000$ksp$]::text[], $ksp$[{"input":"5 100000\n20000 15000 30000 25000 10000","output":"total: 100000\ntarget tercapai di minggu ke-5","penjelasan":"Total baru menyentuh 100000 setelah setoran kelima."},{"input":"3 50000\n10000 5000 20000","output":"total: 35000\ntarget belum tercapai, kurang 15000","penjelasan":"Sampai minggu terakhir totalnya 35000, masih kurang 15000."},{"input":"1 0\n0","output":"total: 0\ntarget tercapai di minggu ke-1","penjelasan":"Target 0 sudah tercapai begitu minggu pertama dicatat."}]$ksp$::jsonb, array[$ksp$Tidak perlu menyimpan semua setoran. Cukup tambahkan ke total setiap kali dibaca.$ksp$, $ksp$Simpan minggu tercapainya di variabel tersendiri, dan isi hanya sekali — saat pertama kali total >= T.$ksp$, $ksp$Setoran tetap harus dibaca sampai habis walaupun target sudah tercapai lebih awal.$ksp$]::text[], 0, array[$ksp$for$ksp$, $ksp$akumulasi$ksp$]::text[]),
  ($ksp$c-06$ksp$, $ksp$segitiga-angka$ksp$, 6, $ksp$Segitiga Angka$ksp$, $ksp$2026-11-16$ksp$, $ksp$2026-11-22T23:59$ksp$, $ksp$SEDANG$ksp$, array[$ksp$perulangan$ksp$]::text[], $ksp$Papan pengumuman lab butuh hiasan untuk acara ulang tahun KSP, dan seseorang
mengusulkan segitiga dari angka. Menggambarnya dengan tangan butuh waktu lama.
Mencetaknya dengan program cukup beberapa baris.

Tugasmu mencetak segitiga angka setinggi `N`.

## Format masukan

Satu bilangan bulat `N`.

## Format keluaran

`N` baris. Baris ke-`i` (dimulai dari 1) berisi:

1. `N − i` spasi,
2. angka `1` sampai `i` secara menaik,
3. angka `i − 1` sampai `1` secara menurun.

Contoh untuk `N = 4`:

```
   1
  121
 12321
1234321
```

Jangan mencetak spasi di akhir baris.$ksp$, array[$ksp$1 <= N <= 9$ksp$, $ksp$Tidak ada spasi di akhir baris$ksp$]::text[], $ksp$[{"input":"3","output":"  1\n 121\n12321","penjelasan":"Baris ke-i diawali N − i spasi, naik dari 1 sampai i, lalu turun lagi ke 1."},{"input":"1","output":"1","penjelasan":"Satu baris, tanpa spasi di depan."},{"input":"5","output":"    1\n   121\n  12321\n 1234321\n123454321","penjelasan":"Baris terakhir selalu rata kiri."}]$ksp$::jsonb, array[$ksp$Satu perulangan luar untuk baris, lalu tiga perulangan dalam: spasi, angka naik, angka turun.$ksp$, $ksp$Banyaknya spasi di baris ke-i adalah N − i.$ksp$, $ksp$Angka turun dimulai dari i − 1, bukan dari i, supaya puncaknya tidak tercetak dua kali.$ksp$]::text[], 0, array[$ksp$nested-loop$ksp$, $ksp$pola$ksp$]::text[]),
  ($ksp$c-07$ksp$, $ksp$bingkai-papan-nama$ksp$, 7, $ksp$Bingkai Papan Nama$ksp$, $ksp$2026-11-23$ksp$, $ksp$2026-11-29T23:59$ksp$, $ksp$SEDANG$ksp$, array[$ksp$prosedur$ksp$, $ksp$perulangan$ksp$]::text[], $ksp$Panitia pameran proyek butuh bingkai papan nama untuk setiap meja. Ukurannya
berbeda-beda, tapi bentuknya selalu sama: tepi dari `#`, bagian dalam dari
titik.

Tugasmu mencetak beberapa bingkai sekaligus. Kodenya akan jauh lebih pendek
kalau bagian yang berulang dipindahkan ke prosedur sendiri.

## Format masukan

Baris pertama berisi `K`, banyaknya bingkai.
`K` baris berikutnya masing-masing berisi dua bilangan bulat: lebar dan tinggi.

## Format keluaran

Setiap bingkai dicetak dalam `tinggi` baris dengan `lebar` karakter per baris.
Baris pertama dan terakhir seluruhnya `#`. Baris di antaranya diawali dan
diakhiri `#`, dengan titik di tengahnya.

Contoh untuk lebar 6 dan tinggi 4:

```
######
#....#
#....#
######
```

Antar bingkai dipisahkan tepat satu baris kosong.$ksp$, array[$ksp$1 <= K <= 10$ksp$, $ksp$1 <= lebar, tinggi <= 50$ksp$, $ksp$Antar bingkai dipisahkan tepat satu baris kosong$ksp$]::text[], $ksp$[{"input":"1\n5 3","output":"#####\n#...#\n#####","penjelasan":"Tepi berupa #, bagian dalam berupa titik."},{"input":"2\n3 3\n1 1","output":"###\n#.#\n###\n\n#","penjelasan":"Dua bingkai, dipisahkan satu baris kosong. Bingkai 1 × 1 hanya satu #."},{"input":"1\n4 1","output":"####","penjelasan":"Tinggi 1 berarti hanya ada satu baris tepi."}]$ksp$::jsonb, array[$ksp$Buat satu prosedur yang mencetak satu baris: karakter tepi, isi sebanyak lebar − 2, lalu tepi lagi.$ksp$, $ksp$Bingkai = baris atas, tinggi − 2 baris tengah, baris bawah. Semuanya memanggil prosedur yang sama.$ksp$, $ksp$Hati-hati dengan lebar atau tinggi 1: tepi kanan dan baris bawah tidak boleh tercetak dua kali.$ksp$]::text[], 0, array[$ksp$prosedur$ksp$, $ksp$pola$ksp$]::text[]),
  ($ksp$c-08$ksp$, $ksp$tiga-angka-berurutan$ksp$, 8, $ksp$Tiga Angka Berurutan$ksp$, $ksp$2027-03-01$ksp$, $ksp$2027-03-07T23:59$ksp$, $ksp$SEDANG$ksp$, array[$ksp$prosedur$ksp$, $ksp$pointer$ksp$]::text[], $ksp$Prosedur yang kamu tulis minggu lalu bisa mencetak, tapi belum bisa mengubah
variabel milik `main`. Minggu ini kita perbaiki itu.

Tugasmu mengurutkan tiga bilangan dari kecil ke besar dengan sebuah prosedur,
dan menghitung berapa kali pertukaran terjadi.

## Aturan pengurutan

Pengurutan dilakukan dengan tiga perbandingan, persis dalam urutan ini:

1. bandingkan `a` dan `b`, tukar kalau `a > b`,
2. bandingkan `b` dan `c`, tukar kalau `b > c`,
3. bandingkan `a` dan `b` sekali lagi, tukar kalau `a > b`.

Setiap pertukaran dihitung satu. Dua bilangan yang sama tidak ditukar.

## Format masukan

Baris pertama berisi `T`, banyaknya kasus.
`T` baris berikutnya masing-masing berisi tiga bilangan bulat `a`, `b`, dan `c`.

## Format keluaran

Satu baris untuk setiap kasus:

```
a b c (J tukar)
```

dengan `a b c` sudah terurut menaik dan `J` banyaknya pertukaran.$ksp$, array[$ksp$1 <= T <= 100$ksp$, $ksp$-1000 <= a, b, c <= 1000$ksp$, $ksp$Pertukaran dihitung sesuai urutan perbandingan di soal$ksp$]::text[], $ksp$[{"input":"3\n3 1 2\n1 2 3\n9 5 1","output":"1 2 3 (2 tukar)\n1 2 3 (0 tukar)\n1 5 9 (3 tukar)","penjelasan":"Data yang sudah urut tidak butuh pertukaran. 9 5 1 butuh ketiganya."},{"input":"1\n4 4 2","output":"2 4 4 (2 tukar)","penjelasan":"Dua angka yang sama tidak ditukar, karena yang kiri tidak lebih besar."}]$ksp$::jsonb, array[$ksp$Prosedur tukar(int a, int b) tidak mengubah apa pun di main. Kirimkan alamatnya: tukar(&a, &b).$ksp$, $ksp$Di dalam prosedur, *a adalah isi variabel yang ditunjuk, bukan alamatnya.$ksp$, $ksp$Jumlah pertukaran juga bisa dikembalikan lewat parameter keluaran, sama seperti angkanya.$ksp$]::text[], 0, array[$ksp$parameter-keluaran$ksp$, $ksp$tukar$ksp$]::text[]),
  ($ksp$c-09$ksp$, $ksp$prima-di-rentang$ksp$, 9, $ksp$Prima di Rentang$ksp$, $ksp$2027-03-15$ksp$, $ksp$2027-03-21T23:59$ksp$, $ksp$SEDANG$ksp$, array[$ksp$fungsi$ksp$, $ksp$perulangan$ksp$]::text[], $ksp$Bilangan prima adalah bilangan lebih dari 1 yang hanya habis dibagi 1 dan
dirinya sendiri. Memeriksa satu bilangan itu mudah. Memeriksa ribuan bilangan
dengan kode yang sama berulang-ulang di dalam `main` itulah yang melelahkan.

Tugasmu mencetak semua bilangan prima di antara `A` dan `B`. Pisahkan
pemeriksaan prima ke dalam sebuah fungsi yang mengembalikan nilai.

## Format masukan

Satu baris berisi dua bilangan bulat `A` dan `B`.

## Format keluaran

Baris pertama berisi semua bilangan prima `p` dengan `A <= p <= B`, terurut
menaik dan dipisahkan satu spasi. Kalau tidak ada satu pun, cetak `-`.

Baris kedua:

```
jumlah: K
```

dengan `K` banyaknya bilangan prima yang ditemukan.$ksp$, array[$ksp$1 <= A <= B <= 100000$ksp$, $ksp$Bilangan prima dicetak menaik, dipisahkan satu spasi$ksp$, $ksp$Batas waktu 1 detik, batas memori 64 MB$ksp$]::text[], $ksp$[{"input":"10 30","output":"11 13 17 19 23 29\njumlah: 6","penjelasan":"Enam bilangan prima di antara 10 dan 30."},{"input":"1 10","output":"2 3 5 7\njumlah: 4","penjelasan":"1 bukan bilangan prima."},{"input":"24 28","output":"-\njumlah: 0","penjelasan":"Tidak ada prima di rentang ini, jadi baris pertama berisi tanda minus."}]$ksp$::jsonb, array[$ksp$Tulis fungsi int prima(int n) yang mengembalikan 1 kalau prima dan 0 kalau bukan.$ksp$, $ksp$Cukup coba pembagi dari 2 selama d × d <= n. Kalau tidak ada yang habis membagi, n prima.$ksp$, $ksp$Cetak spasi sebelum setiap bilangan kecuali yang pertama, supaya tidak ada spasi berlebih.$ksp$]::text[], 0, array[$ksp$fungsi$ksp$, $ksp$prima$ksp$]::text[]),
  ($ksp$c-10$ksp$, $ksp$suhu-rata-rata-laboratorium$ksp$, 10, $ksp$Suhu Rata-Rata Laboratorium$ksp$, $ksp$2027-04-26$ksp$, $ksp$2027-05-02T23:59$ksp$, $ksp$MUDAH$ksp$, array[$ksp$array$ksp$]::text[], $ksp$Laboratorium FTI memasang termometer digital di empat sudut ruang server. Setiap
jam, angkanya dicatat ke dalam satu berkas. Bagian kelistrikan ingin ringkasan
harian yang bisa dibaca sekilas, bukan deretan angka mentah.

Tugasmu menulis program yang membaca sederet suhu lalu mencetak rata-rata,
suhu tertinggi, dan suhu terendah.

## Format masukan

Baris pertama berisi satu bilangan bulat `N`, banyaknya pencatatan.
Baris kedua berisi `N` bilangan bulat yang dipisahkan spasi.

## Format keluaran

Tiga baris, dengan format persis seperti ini:

```
rata-rata: X.XX
tertinggi: Y
terendah: Z
```

Rata-rata dicetak dengan dua angka di belakang koma. Perhatikan bahwa pembagian
antar bilangan bulat di C membuang sisanya — `7 / 2` bernilai `3`, bukan `3.5`.
Kamu harus mengubah tipenya lebih dulu.$ksp$, array[$ksp$1 <= N <= 1000$ksp$, $ksp$-50 <= suhu <= 100$ksp$, $ksp$Rata-rata dicetak dengan tepat dua angka di belakang koma$ksp$, $ksp$Batas waktu 1 detik, batas memori 64 MB$ksp$]::text[], $ksp$[{"input":"5\n21 24 23 27 20","output":"rata-rata: 23.00\ntertinggi: 27\nterendah: 20","penjelasan":"Jumlah seluruh suhu 115, dibagi 5 menghasilkan tepat 23."},{"input":"1\n30","output":"rata-rata: 30.00\ntertinggi: 30\nterendah: 30","penjelasan":"Dengan satu data, ketiganya bernilai sama."},{"input":"4\n-3 -1 0 4","output":"rata-rata: 0.00\ntertinggi: 4\nterendah: -3","penjelasan":"Suhu negatif tetap dihitung. Totalnya nol, jadi rata-ratanya nol."}]$ksp$::jsonb, array[$ksp$Nilai awal untuk tertinggi dan terendah sebaiknya diambil dari elemen pertama, bukan dari 0.$ksp$, $ksp$total / n memakai pembagian bulat. Ubah salah satu operandnya ke double sebelum membagi.$ksp$, $ksp$printf("%.2f", x) mencetak dua angka di belakang koma dan sudah membulatkan sendiri.$ksp$]::text[], 0, array[$ksp$array$ksp$, $ksp$min-max$ksp$]::text[]),
  ($ksp$c-11$ksp$, $ksp$ipk-tertinggi-angkatan$ksp$, 11, $ksp$IPK Tertinggi Angkatan$ksp$, $ksp$2027-05-03$ksp$, $ksp$2027-05-09T23:59$ksp$, $ksp$SEDANG$ksp$, array[$ksp$record$ksp$]::text[], $ksp$Bagian akademik ingin memberi penghargaan untuk mahasiswa dengan IPK tertinggi
di angkatannya. Datanya ada: nama, NPM, dan IPK setiap mahasiswa. Ketiganya
milik orang yang sama, jadi sebaiknya disimpan bersama juga.

Tugasmu mencari mahasiswa dengan IPK tertinggi memakai `struct`.

## Format masukan

Baris pertama berisi bilangan bulat `N`.
`N` baris berikutnya masing-masing berisi nama tanpa spasi, NPM, dan IPK,
dipisahkan satu spasi.

## Format keluaran

Satu baris:

```
<nama> (<npm>) <ipk>
```

IPK dicetak dengan dua angka di belakang koma. Kalau ada beberapa mahasiswa
dengan IPK tertinggi yang sama, cetak yang paling dulu muncul di masukan.$ksp$, array[$ksp$1 <= N <= 1000$ksp$, $ksp$Nama tanpa spasi, panjang <= 32 karakter$ksp$, $ksp$NPM berupa 9 digit$ksp$, $ksp$0.00 <= IPK <= 4.00, dengan dua angka di belakang koma$ksp$]::text[], $ksp$[{"input":"3\nAlya 240711001 3.72\nBimo 240711002 3.85\nCitra 240711003 3.85","output":"Bimo (240711002) 3.85","penjelasan":"Bimo dan Citra seri. Yang dicetak adalah yang lebih dulu muncul."},{"input":"1\nDamar 240711010 2.50","output":"Damar (240711010) 2.50","penjelasan":"Satu mahasiswa otomatis menjadi yang tertinggi."}]$ksp$::jsonb, array[$ksp$Satu struct Mahasiswa berisi nama, NPM, dan IPK. NPM lebih aman disimpan sebagai teks.$ksp$, $ksp$Tidak perlu menyimpan semua data. Cukup dua variabel struct: yang sedang dibaca dan yang terbaik sejauh ini.$ksp$, $ksp$Struct bisa disalin utuh dengan satu penugasan: terbaik = sekarang;$ksp$]::text[], 0, array[$ksp$struct$ksp$, $ksp$maksimum$ksp$]::text[]),
  ($ksp$c-12$ksp$, $ksp$papan-peringkat-kelas$ksp$, 12, $ksp$Papan Peringkat Kelas$ksp$, $ksp$2027-05-18$ksp$, $ksp$2027-05-23T23:59$ksp$, $ksp$SULIT$ksp$, array[$ksp$array$ksp$, $ksp$record$ksp$]::text[], $ksp$Rekap nilai kelas selama ini disimpan sebagai dua array terpisah: satu untuk
nama, satu untuk nilai. Sistemnya bertahan sampai seseorang perlu mengurutkan
data itu, dan menyadari kedua array harus digeser bersamaan supaya indeksnya
tetap sejajar. Satu kali lupa, dan nilai orang lain menempel di namamu.

Tugasmu menyusun papan peringkat memakai array of record, lalu mengurutkannya.

## Format masukan

Baris pertama berisi bilangan bulat `N`.
`N` baris berikutnya masing-masing berisi sebuah nama tanpa spasi dan sebuah
nilai, dipisahkan satu spasi.

## Format keluaran

`N` baris, terurut berdasarkan nilai dari besar ke kecil. Kalau nilainya sama,
urutkan berdasarkan nama secara alfabetis menaik. Setiap baris berformat:

```
<peringkat>. <nama> <nilai>
```

Peringkat dimulai dari 1 dan selalu bertambah satu, termasuk saat nilainya sama.

## Catatan

Saat menukar dua elemen, tukar struct-nya utuh — nama dan nilai ikut pindah
bersama. Itulah keuntungan record dibanding dua array terpisah.

Untuk membandingkan dua nama, pakai `strcmp` dari `string.h`. Operator `<`
pada dua array karakter membandingkan alamatnya, bukan isinya.$ksp$, array[$ksp$1 <= N <= 100$ksp$, $ksp$Nama tanpa spasi, panjang <= 32 karakter$ksp$, $ksp$0 <= nilai <= 100$ksp$, $ksp$Urutan: nilai menurun, lalu nama menaik bila seri$ksp$]::text[], $ksp$[{"input":"4\nNadia 92\nGilang 95\nRangga 92\nIvana 88","output":"1. Gilang 95\n2. Nadia 92\n3. Rangga 92\n4. Ivana 88","penjelasan":"Nadia dan Rangga sama-sama 92, jadi urutannya ditentukan secara alfabetis."},{"input":"2\nBimo 70\nAlya 70","output":"1. Alya 70\n2. Bimo 70","penjelasan":"Nilainya identik, sehingga seluruh urutan ditentukan oleh nama."},{"input":"1\nDamar 100","output":"1. Damar 100","penjelasan":"Satu peserta tetap harus dicetak dengan format peringkat yang sama."}]$ksp$::jsonb, array[$ksp$Satu array of struct berisi nama dan nilai jauh lebih aman daripada dua array yang harus dijaga sejajar.$ksp$, $ksp$Bubble sort cukup untuk N <= 100: bandingkan dua elemen bersebelahan, tukar kalau urutannya salah.$ksp$, $ksp$strcmp(a, b) bernilai positif kalau a seharusnya di belakang b secara alfabetis.$ksp$]::text[], 0, array[$ksp$array-of-record$ksp$, $ksp$sorting$ksp$]::text[]);

