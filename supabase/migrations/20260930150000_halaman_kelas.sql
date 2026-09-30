-- Each class except C gets its own registration page, /gabung/<id>, and
-- this is its content. C's page is /gabung, which is written in code.
-- Admins edit these fields in /admin/pendaftaran/<id>.

alter table public.registration_tracks
  add column ringkasan text not null default '',
  add column syarat text[] not null default '{}',
  add column isi_mdx text not null default '',
  add column poster text check (poster is null or poster ~ '^https://');

grant update (ringkasan, syarat, isi_mdx, poster) on public.registration_tracks to authenticated;

-- Blockchain Dev Class, from its announcement and poster.
update public.registration_tracks set
  ringkasan = $ksp$Kelas kolaborasi UAJY Blockchain Club x KSP yang mengubah "cuma tahu dasar ngoding" jadi "pernah mengerjakan e2e development dengan case blockchain", lewat satu produk nyata dari smart contract pertama sampai demo akhir.$ksp$,
  syarat = array[
    $ksp$Terbuka untuk semua mahasiswa. Semester 3 ke atas disarankan, tapi mahasiswa semester 1 juga dipersilakan$ksp$,
    $ksp$Punya pengetahuan dasar pemrograman$ksp$,
    $ksp$Tertarik dengan pengembangan software dan mau belajar$ksp$
  ],
  isi_mdx = $ksp$## Kenapa ikut?

Dunia teknologi berubah cepat, dan yang bakal menonjol adalah mahasiswa yang
paham fundamental dan bisa bekerja bareng AI. Di kelas ini kamu belajar
keduanya lewat satu produk nyata, dari smart contract pertama sampai demo akhir.

## Yang akan kamu bangun

- Smart contract yang diuji dan di-deploy dengan Foundry
- Indexing dan backend JavaScript
- Frontend dengan integrasi wallet
- Pola pikir produk (SDLC) dan pengalaman kerja bareng AI sebagai co-pilot, bukan saingan

Filosofinya: fundamental dulu. Pakai analogi, bukan jargon. Praktik, bukan cuma
slide. Dan tidak ada yang ditinggal.

<Callout type="warning">
Ini bukan kelas trading kripto. Tinggalkan pola pikir trading di luar kelas: di
sini kita belajar membangun software.
</Callout>

## Jadwal dan biaya

- Setiap Jumat pukul 19.00
- 16 Oktober – 4 Desember 2026
- HTM Rp50.000, sudah termasuk administrasi dan sertifikat
- Setengah dari HTM (Rp25.000) adalah *commitment fee* yang dikembalikan kalau kamu hadir dan menyelesaikan kelas

## Pendaftaran

Pendaftaran dibuka 30 September sampai 9 Oktober 2026, dengan kuota 25 mahasiswa.
$ksp$,
  poster = 'https://bgrgkqrolpgcmbdlruzt.supabase.co/storage/v1/object/public/media/berita/30d46e57-417f-4d54-85c7-c49530011d1a.jpg'
where id = 'blockchain';
