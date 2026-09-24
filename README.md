# Situs Kelompok Studi Pemrograman UAJY

Situs komunitas belajar bahasa C di Program Studi Informatika, Universitas Atma Jaya Yogyakarta: kelas, tentor, challenge mingguan, hall of fame, berita, dan galeri.

Dibangun dengan **Next.js 16** (App Router, Turbopack), **React 19**, **Tailwind CSS 4**, **Motion**, **MDX**, dan **Supabase** (Postgres). Halaman publik tetap dirender statis. Konten yang diurus admin (modul, berita, challenge, pendaftaran) dibaca dari database dan disegarkan lewat tag cache begitu berubah.

> Next.js 16 punya banyak perubahan dari versi sebelumnya. Sebelum mengubah kode, baca panduan di `node_modules/next/dist/docs/`.

---

## Menjalankan

Butuh Node.js 20 atau lebih baru; **22 direkomendasikan** (`supabase-js` akan berhenti mendukung Node 20). Untuk `verify:c` juga butuh `gcc` di `PATH`.

```bash
npm install
cp .env.example .env.local   # lalu isi keempat nilainya (lihat komentar di file)
npm run dev                  # http://localhost:3000
```

`.env.local` berisi kunci Supabase dan **tidak boleh di-commit** (sudah ada di `.gitignore`). `.env.example` hanya template; jangan isi kunci asli di sana.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan dengan hot reload |
| `npm run build` | Build produksi, sekaligus prerender semua halaman dan gambar OG |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | Menjalankan ketiga pemeriksa konten di bawah |
| `npm run verify:c` | Mengompilasi setiap berkas C dengan `-std=c17 -Wall -Wextra -Werror`, lalu mencocokkan keluaran solusi pemenang dengan sample I/O soalnya |
| `npm run verify:data` | Memeriksa id dan slug ganda, referensi silang (misalnya `pemenangId` ke pemenang yang ada), dan keberadaan setiap berkas konten |
| `npm run verify:mdx` | Mengompilasi setiap berkas MDX, supaya `<` atau `{` yang lepas ketahuan sebelum build |
| `npm run db:push` | Menerapkan migrasi baru di `supabase/migrations/` ke database (`-- --dry-run` untuk melihat dulu, `-- --seed` untuk sekaligus mengisi seed) |
| `npm run db:types` | Membuat ulang `src/lib/supabase/database.types.ts` dari skema database. Jalankan setiap selesai menambah migrasi |
| `npm run seed:generate` | Menulis `supabase/seed.sql` dari berkas konten awal |
| `npm run akun -- buat --npm <NPM> --nama "<Nama>" [--peran anggota\|tentor\|admin] [--angkatan <tahun>]` | Membuat akun dan mencetak password sekali pakai |
| `npm run akun -- reset --npm <NPM>` | Membuat password sekali pakai baru untuk anggota yang lupa |

Pemeriksa `verify:*` membaca berkas konten awal (seed), bukan database. Jalankan setelah mengubah berkas-berkas itu.

---

## Struktur

```
src/
  app/                  rute (satu folder per halaman), opengraph-image, sitemap, robots, manifest
  components/
    layout/             nav, footer, theme rocker
    sections/<halaman>/ komponen milik satu halaman
    ui/                 primitif bersama: TerminalWindow, Button, Badge, Accordion, Flag, ...
    mdx/                cara MDX dirender (heading, kode C, Callout)
    seo/                JSON-LD
  content/              isi panjang: MDX soal & berita, berkas .c solusi & snippet
  lib/
    data/               data per jenis konten (berkas) + seed awal untuk database
    data/index.ts       SATU-SATUNYA pintu masuk data ke komponen
    supabase/           klien publik, tipe database, pemetaan baris -> tipe aplikasi
    types.ts            model konten
    metadata.ts         metadata per halaman (title, canonical, Open Graph)
    og.tsx              generator kartu Open Graph
  site.config.ts        nama, tagline, logo, URL, formulir pendaftaran, navigasi
  assets/fonts/         TTF untuk gambar OG (lisensi OFL ada di sebelahnya)
scripts/                pemeriksa konten (verify-*), generator seed, helper db
supabase/
  migrations/           skema database (SQL), diterapkan dengan `npm run db:push`
  seed.sql              isi awal database, dihasilkan `npm run seed:generate`
```

### Aturan data

Komponen **tidak pernah** mengimpor dari `src/lib/data/<jenis>.ts` atau dari Supabase secara langsung. Semua lewat fungsi async di `src/lib/data/index.ts` (`getNewsPosts()`, `getChallengeBySlug()`, dan seterusnya), yang selalu mengembalikan tipe dari `src/lib/types.ts`.

Ada dua sumber data:

| Sumber | Isi | Cara mengubah |
| --- | --- | --- |
| **Supabase** | modul, berita, challenge + pemenang, gelombang pendaftaran, akun | **panel admin** di `/admin` |
| **Berkas** di `src/lib/data/` | pengurus, tentor, galeri, halaman tentang, info bergabung, angka klub | edit berkas, lalu deploy |

Pembacaan dari Supabase memakai `publicDb(tag)` (`src/lib/supabase/public.ts`): kunci publik, tanpa cookie, dengan tag cache `modul`, `berita`, `challenge`, atau `pendaftaran`. Setelah data berubah, `revalidateTag(tag, 'max')` menyegarkan semua halaman yang memakainya pada kunjungan berikutnya. Halaman yang statusnya bergantung pada jam (modul, challenge, pendaftaran) juga diregenerasi setiap jam.

Setiap tabel dilindungi *row-level security*. Pengunjung hanya bisa membaca, draf berita tidak terlihat, dan penulisan hanya untuk akun admin.

Setiap modul data mengimpor `server-only`, jadi data dan kunci tidak mungkin ikut terkirim ke browser.

---

## Model konten

Definisi lengkapnya ada di `src/lib/types.ts`. Semua field wajib kecuali yang ditandai opsional.

| Jenis | Metadata | Isi panjang | Muncul di |
| --- | --- | --- | --- |
| Pengurus (`Member`) | `lib/data/members.ts` | — | `/struktur`, `/struktur#<slug>` |
| Tentor (`Tentor`) | `lib/data/tentors.ts` | `content/snippets/<slug>.c` | `/tentor`, `/tentor/<slug>` |
| Challenge (`Challenge`) | tabel `challenges` | kolom `deskripsi_mdx` | `/challenge`, `/challenge/<slug>`, beranda |
| Pemenang (`Winner`) | tabel `winners` | kolom `kode_solusi` | `/hall-of-fame`, `/hall-of-fame/<slug>`, detail challenge |
| Berita (`NewsPost`) | tabel `news_posts` | kolom `body_mdx` | `/berita`, `/berita/<slug>`, beranda |
| Galeri (`GalleryItem`) | `lib/data/gallery.ts` | — | `/galeri`, `/galeri#<id>`, beranda |
| Cara bergabung (`JoinInfo`) | `lib/data/gabung.ts` | — | `/gabung`, hero dan bagian penutup beranda |
| Tentang (`AboutInfo`) | `lib/data/tentang.ts` | — | `/tentang` |
| Modul kelas (`Modul`) | tabel `modules` | tautan `berkas_url` | `/modul`, hero beranda |
| Gelombang pendaftaran | tabel `registration_rounds` | — | hero, `/gabung` |
| Angka klub | `lib/data/stats.ts` | — | beranda, `/tentang` |

Konvensi yang berlaku di semua jenis:

- **Tanggal** ditulis sebagai string ISO: `YYYY-MM-DD`. Deadline challenge ditulis sebagai `YYYY-MM-DDTHH:mm` dan selalu dibaca sebagai **WIB**, di mesin mana pun build berjalan.
- **`slug`** hanya berisi huruf kecil, angka, dan tanda hubung, dan dipakai sebagai URL. Mengganti slug berarti mengganti URL.
- **`id`** unik per jenis (`n-09`, `g-25`, `c-13`, `w-12`, ...).
- **Gambar** harus mencantumkan `width` dan `height` aslinya, supaya tata letak tidak bergeser saat gambar dimuat. Foto potret selalu 640×800, sampul berita 1200×675.
- **`alt`** wajib berupa deskripsi dalam bahasa Indonesia.

> Berita, challenge, modul, pendaftaran, dan akun dikelola lewat **panel admin di `/admin`**. Bagian di bawah menjelaskan aturan isinya, yang juga berlaku di panel. Berkas di `src/lib/data/` dan `src/content/` untuk jenis-jenis ini hanya **seed awal**.

### Menambah berita

1. Tambahkan satu baris di tabel `news_posts`: `id`, `slug`, `judul`, `tanggal`, `kategori` (`pengumuman` · `liputan` · `tutorial` · `prestasi`), `cover`, `excerpt`, `penulis`, `body_mdx`, `tags`. `published = false` menyimpannya sebagai draf.
2. Isi `body_mdx` dengan MDX. Jangan menulis judul `#` di dalam isi, karena judul diambil dari data. Setiap `##` otomatis masuk daftar isi.
3. Halaman `/berita/<slug>` langsung bisa dibuka. Daftar berita ikut diperbarui setelah tag `berita` disegarkan, yang dilakukan panel admin secara otomatis.

Kalau nama `penulis` persis sama dengan nama tentor atau pengurus, byline-nya otomatis tertaut ke profil orang itu. Berita dengan tag `pendaftaran` yang paling baru dipakai sebagai "pengumuman" di `/gabung`.

Komponen yang tersedia di MDX:
- blok kode berlabel ` ```c `: syntax highlighting, nomor baris, dan tombol salin
- blok kode tanpa label: tampil sebagai format keluaran
- tabel GFM
- `<Callout type="note">…</Callout>` dan `<Callout type="warning">…</Callout>`

### Menambah challenge mingguan

1. Tambahkan baris di tabel `challenges`. `sample_io` berupa array JSON `[{ "input", "output", "penjelasan" }]`, dan `output` harus berisi keluaran **persis**. `deadline` ditulis sebagai waktu WIB.
2. Tulis soalnya di kolom `deskripsi_mdx`. Paragraf pertama otomatis menjadi teaser di beranda dan arsip.
3. Setelah deadline lewat dan pemenang ditentukan, tambahkan baris di tabel `winners` dengan `challenge_id` challenge tersebut, lalu isi `kode_solusi` dengan kode C-nya. Satu challenge hanya bisa punya satu pemenang.

Status buka atau tutup dihitung dari jam. Halaman challenge dan beranda diregenerasi setiap jam (`revalidate = 3600`), dan hitung mundurnya berjalan di browser pengunjung.

### Modul mingguan

Jadwal modul ada di tabel `modules`, satu baris per minggu: `minggu`, `judul`, `rilis` (tanggal Senin modul dibagikan, `YYYY-MM-DD`, WIB), `tentorPj`, `koordinator`, `ringkasan`, dan `berkasUrl` (opsional).

Status setiap modul dihitung dari jam, jadi tidak perlu diubah tiap minggu:

| Status | Kapan | Tampilan |
| --- | --- | --- |
| terkunci | sebelum `rilis` | redup, dengan tanggal buka; tautan berkas tidak ditampilkan |
| minggu ini | dari `rilis` sampai `rilis` modul berikutnya | kartu besar di atas, disorot di timeline |
| selesai | setelahnya | tetap bisa dibuka |

- **Mengunggah berkas:** isi `berkas_url` (misalnya tautan Google Drive yang bisa dilihat siapa saja). Sebelum diisi, halaman menampilkan "berkas menyusul".
- **Libur atau UTS:** geser `rilis` modul-modul setelahnya.

`/modul` diregenerasi setiap jam, jadi pergantian minggu tampil paling lambat satu jam setelah Senin pukul 00.00 WIB. Setiap minggu juga punya anchor sendiri, misalnya `/modul#minggu-02`.

### Membuka gelombang pendaftaran baru

Tambahkan baris baru di tabel `registration_rounds` dengan `buka` dan `tutup` (waktu WIB). Gelombang yang dipakai adalah yang `buka`-nya paling baru; gelombang lama tetap tersimpan sebagai riwayat. Lalu terbitkan pengumumannya sebagai berita bertag `pendaftaran`. Status pendaftaran dihitung dari jam:

| Status | Kapan | Tombol utama di hero, bagian gabung beranda, dan `/gabung` |
| --- | --- | --- |
| `segera` | sebelum `buka` | "coba challenge dulu", ditambah tanggal pembukaan |
| `buka` | `buka` sampai `tutup` | "daftar sekarang", menuju `siteConfig.joinFormUrl` |
| `tutup` | setelah `tutup` | "coba challenge dulu", ditambah keterangan bahwa gelombang ini sudah ditutup |

Beranda dan `/gabung` diregenerasi setiap jam, jadi perubahan status tampil di situs paling lambat satu jam setelah waktunya.

### Menambah foto atau video galeri

Tambahkan objek di `src/lib/data/gallery.ts` dengan `width`/`height` asli. Untuk video, isi `type: 'video'` dan `videoUrl` (MP4). Gambar dari domain selain `picsum.photos` harus didaftarkan dulu di `images.remotePatterns` di `next.config.ts`, atau taruh berkasnya di `public/`.

Setiap item bisa ditautkan langsung: `/galeri#g-07` membuka item itu di lightbox.

---

## Merek dan identitas

Semua yang berbau merek ada di **`src/site.config.ts`**: nama, tagline, logo, kampus, URL situs, email, media sosial, URL formulir pendaftaran, dan urutan navigasi. Mengubah salah satunya tidak perlu menyentuh komponen.

Nilai yang **masih placeholder** dan harus diganti sebelum rilis. Cari dengan `grep -rn "TODO(brand)" src`.

| Apa | Di mana |
| --- | --- |
| Tagline | `site.config.ts` → `tagline` |
| URL formulir pendaftaran | `site.config.ts` → `joinFormUrl` |
| URL situs | `site.config.ts` → `url` (dipakai untuk canonical, sitemap, dan Open Graph) |
| Tahun berdiri dan cerita awal | `lib/data/tentang.ts` → entri pertama `sejarah` |
| Foto | seluruh `foto`, `cover`, dan `src` masih memakai picsum.photos |

---

## Akun dan login

Anggota masuk di **`/masuk`** dengan **NPM + password**. Di balik layar, setiap NPM dipetakan ke alamat email sintetis `<NPM>@anggota.ksp.invalid` di Supabase Auth. Domain `.invalid` dicadangkan RFC 2606 sehingga tidak pernah menjadi alamat sungguhan, dan tidak ada yang perlu melihat atau mengetiknya.

| Peran | Bisa |
| --- | --- |
| `anggota` | dashboard, modul, mengumpulkan tugas guided |
| `tentor` | + menilai tugas guided di modul yang ditugaskan kepadanya (`/penilaian`) |
| `admin` | + panel admin: modul, challenge, berita, pendaftaran, akun; bisa menilai semua modul |

- **Akun tidak bisa dibuat sendiri.** Admin membuatnya di **`/admin/anggota`** (atau lewat `npm run akun`), dan sistem memberi **password sekali pakai**. Saat pertama masuk, anggota wajib menggantinya sebelum bisa membuka halaman lain.
- **Lupa password:** admin menekan **reset password** di `/admin/anggota` (atau `npm run akun -- reset --npm <NPM>`) untuk membuat password sekali pakai baru.
- **Penjagaan tiga lapis:**
  1. `src/proxy.ts` hanya berjalan di `/masuk`, `/dashboard`, `/admin`, `/penilaian`: menyegarkan sesi dan mengalihkan tamu. Halaman publik tidak melewatinya dan tetap statis.
  2. Setiap halaman akun memanggil `requireProfile()` (`src/lib/auth/session.ts`): memverifikasi token, memastikan profil anggota ada, memaksa ganti password, dan mengecek peran.
  3. *Row-level security* di database menentukan baris apa yang boleh dibaca atau ditulis.
- **Wajib di dashboard Supabase:** matikan pendaftaran publik di **Authentication → Sign In / Providers → Allow new users to sign up**. Pembuatan akun oleh admin tetap berfungsi.

Akun admin pertama dibuat dari terminal (panel admin belum bisa dibuka sebelum ada admin):

```bash
npm run akun -- buat --npm 220711234 --nama "Nama Lengkap" --peran admin
```

## Panel admin

**`/admin`** hanya bisa dibuka akun berperan `admin`. Isinya:

| Bagian | Isi |
| --- | --- |
| **ringkasan** | jumlah anggota, modul minggu ini beserta tugas yang masuk, tugas yang belum dinilai, draf berita, status pendaftaran |
| **anggota** | buat satu akun, **impor** banyak akun sekaligus (tempel NPM, Nama, Angkatan langsung dari spreadsheet), ubah nama/angkatan/peran, reset password, hapus akun |
| **modul** | ubah judul, minggu, tanggal rilis, tentor PJ, koordinator, ringkasan, instruksi dan tenggat tugas guided; unggah **PDF modul** (maks 20 MB) atau tempel tautan; tambah atau hapus modul |
| **berita** | tulis dan sunting dengan **pratinjau MDX**, unggah gambar sampul (maks 3 MB), simpan sebagai **draf** atau terbitkan, hapus |
| **challenge** | soal (MDX dengan pratinjau), contoh masukan/keluaran, batasan, petunjuk bertingkat, topik; **umumkan pemenang** (foto, pendekatan, kode solusi) |
| **pendaftaran** | jadwalkan gelombang baru, ubah tanggal, **tutup sekarang** |

Hal-hal yang perlu diketahui:

- **Perubahan langsung terlihat.** Setiap simpan menyegarkan tag cache yang bersangkutan (`updateTag`), jadi halaman publik yang memakai data itu memuat versi baru pada kunjungan berikutnya.
- **Password dari panel hanya tampil sekali.** Setelah membuat atau mereset akun, salin atau unduh CSV-nya sebelum meninggalkan halaman, karena password tidak disimpan di mana pun.
- **Menghapus selalu minta konfirmasi dengan mengetik ulang** NPM, judul, atau slug. Menghapus akun atau modul ikut menghapus tugas guided yang terkait, termasuk berkasnya.
- **MDX diperiksa sebelum disimpan.** Tanda `<` atau `{` yang lepas di teks biasa ditolak dengan nomor barisnya, jadi berita atau soal yang rusak tidak pernah terbit.
- **Isian tidak hilang saat ada error.** Form admin tidak di-reset ketika server menolak isian, jadi admin cukup membetulkan kolom yang ditandai.
- **Admin tidak bisa menurunkan perannya sendiri atau menghapus akunnya sendiri**, supaya klub tidak pernah kehilangan admin terakhir.
- **Setiap aksi admin diperiksa dua kali**: sekali di kode (`requireAdminAction`) dan sekali oleh *row-level security* di database.

## Tugas guided

Setiap modul punya satu tugas guided. Anggota mengumpulkannya di **`/dashboard`**, berupa **satu berkas `.c`** atau **satu folder yang di-zip** (berisi minimal satu `.c`), maksimal **5 MB**.

- **Tenggat:** kolom `tenggat` di tabel `modules` (WIB). Kalau kosong, tenggatnya **Minggu 23.59** di minggu modul itu. Setelah tenggat, pengumpulan tetap diterima tapi ditandai **terlambat**. Tanda itu dihitung oleh server, bukan browser.
- **Instruksi:** kolom `tugas_deskripsi` di tabel `modules`. Kalau kosong, ditampilkan instruksi umum.
- **Kumpul ulang:** boleh kapan saja selama belum dinilai. Berkas lama diganti, jadi hanya ada satu pengumpulan per modul per anggota. Tugas yang sudah dinilai terkunci.
- **Alur upload:** browser memeriksa berkas lebih dulu, lalu server menerbitkan *signed upload URL* sekali pakai dan browser mengunggah langsung ke Supabase Storage (bucket privat `tugas`). Setelah itu server mengunduh ulang berkas itu, memeriksanya lagi, dan baru mencatatnya. Berkas yang tidak lolos pemeriksaan langsung dihapus. Dengan alur ini, berkas 5 MB tidak perlu melewati server Next, yang di Vercel dibatasi sekitar 4,5 MB per request.
- **Pemeriksaan isi** ada di `src/lib/tugas/rules.ts` dan dipakai browser maupun server. Berkas `.c` harus berupa teks. Zip harus berisi tepat satu folder dengan minimal satu `.c`, tanpa jalur aneh (`../`). Berkas sampingan macOS/Windows (`__MACOSX`, `.DS_Store`) diabaikan.
- **Privasi:** tabel `submissions` hanya bisa dibaca pemiliknya dan staf (tentor/admin), dan tidak bisa ditulis siapa pun lewat API. Berkas hanya bisa diunduh lewat tautan bertanda tangan yang berlaku **60 detik**, dibuat setelah pengecekan kepemilikan.

## Penilaian

Tentor menilai tugas guided di **`/penilaian`**.

1. **Admin menugaskan tentor ke modul** di `/admin/modul/<modul>` → *tentor penilai*. Kalau modul itu belum punya penugasan, akun tentor yang nama depannya sama dengan salah satu nama di *tentor PJ* sudah dicentang otomatis. Admin cukup memeriksa, lalu menyimpan. Satu modul boleh punya beberapa tentor.
2. **Tentor membuka `/penilaian`** dan hanya melihat modul yang ditugaskan kepadanya. Admin melihat semua modul. Per modul ada tiga kelompok: *menunggu nilai*, *sudah dinilai*, dan *belum mengumpulkan*.
3. **Halaman detail menampilkan kodenya langsung.** Berkas `.c` tampil dengan syntax highlighting. Isi zip dibongkar di server dan setiap berkas teks ditampilkan, dengan batas 64 KB per berkas dan 400 KB total. Berkas asli tetap bisa diunduh.
4. **Nilai 0–100 dan komentar** langsung muncul di dashboard anggota, beserta nama penilainya. Tugas yang sudah dinilai terkunci. Kalau anggota perlu mengunggah perbaikan, tekan **buka kembali**: nilainya dihapus dan pengumpulan dibuka lagi.

Pembatasan ini ditegakkan database, bukan hanya tampilan. Tabel `module_tentors` dan fungsi `can_grade()` membuat tentor tidak bisa membaca, apalagi menilai, tugas dari modul yang bukan miliknya, sekalipun ia memanggil API langsung.

## Logo

Sumbernya `src/assets/img/cropped-NEW-LOGO (1).png`. Turunannya dibuat dari file itu:

| File | Dipakai untuk |
| --- | --- |
| `src/assets/img/ksp-logo.png` | navigasi, footer, kartu Open Graph (dipangkas, lebar 800 px) |
| `public/logo/ksp-logo.png` | data terstruktur (JSON-LD) |
| `src/app/favicon.ico`, `src/app/icon.png` | favicon: tulisan **KSP** piksel 3×5 hitam di atas magenta `#ff3d8b`, digambar per ukuran (16/32/48 px) supaya tajam; logo lengkap tidak terbaca di ukuran tab |
| `src/app/apple-icon.png` | ikon layar utama iOS (logo lengkap di tengah latar gelap) |
| `public/logo/icon-192.png`, `icon-512.png` | manifest aplikasi |

Kalau logonya berganti, buat ulang semua turunan ini dari file sumber yang baru.

## SEO dan berbagi tautan

- **Metadata**: setiap halaman memanggil `pageMetadata()` dari `src/lib/metadata.ts`. Jangan menulis `openGraph` sendiri di halaman. Next menggabungkan metadata secara dangkal (shallow merge), jadi halaman yang menulis `openGraph` sebagian akan kehilangan field lainnya.
- **Gambar Open Graph**: `opengraph-image.tsx` di tiap rute memanggil `renderOgCard()`. Semuanya dibuat saat build, termasuk untuk setiap berita, challenge, tentor, dan juara.
- **`/sitemap.xml`**, **`/robots.txt`**, dan **`/manifest.webmanifest`** dibuat dari data, jadi konten baru otomatis ikut. `/kitchen-sink` (lembar spesimen komponen, hanya ada di mode dev) dan halaman akun (`/masuk`, `/dashboard`, `/admin`) dikecualikan.
- **JSON-LD**: beranda memuat `Organization`, setiap berita memuat `NewsArticle`.

---

## Aksesibilitas dan gerak

- Setiap halaman punya tepat satu `<h1>`. Semua gambar punya `alt`. Filter dan panel bisa dipakai penuh dengan keyboard.
- Warna teks memenuhi WCAG AA di kedua tema. Kontras yang dipakai dicatat di `globals.css`.
- `prefers-reduced-motion` dihormati di semua tempat: animasi berubah menjadi fade pendek tanpa gerak.
- Tanpa JavaScript, semua konten tetap terbaca. Kontrol yang butuh script (filter arsip) disembunyikan lewat `data-needs-js`.

---

## Database

Skema ada di `supabase/migrations/`. Setiap perubahan skema dibuat sebagai berkas migrasi baru (jangan mengedit yang lama), lalu:

```bash
npm run db:push -- --dry-run   # periksa dulu
npm run db:push                # terapkan
npm run db:types               # perbarui tipe TypeScript
```

Semua waktu jam dinding (deadline, rilis, periode pendaftaran) disimpan sebagai `timestamp` tanpa zona dan selalu berarti **WIB**.

## Deploy

Direkomendasikan Vercel: impor repositori dan terima pengaturan bawaannya. Isi keempat variabel dari `.env.example` di pengaturan *Environment Variables* Vercel (kecuali `SUPABASE_DB_URL`, yang hanya dipakai CLI di laptop). Sebelum deploy pertama, ganti `siteConfig.url` dengan domain asli, supaya canonical, sitemap, dan gambar OG menunjuk ke alamat yang benar.
