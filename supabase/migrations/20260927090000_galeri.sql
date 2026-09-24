-- =====================================================================
-- Gallery, managed from the admin panel.
-- =====================================================================

create table public.gallery_items (
  id text primary key,
  -- The photo, or a video's poster frame. Public URL (media bucket or any https).
  src text not null check (src ~ '^https://'),
  alt text not null check (length(trim(alt)) > 0),
  caption text not null default '',
  tanggal date not null,
  kategori text not null check (kategori in ('workshop', 'kelas', 'kompetisi', 'gathering', 'lainnya')),
  -- Intrinsic size, so the masonry grid reserves the right box before load.
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  type text not null default 'image' check (type in ('image', 'video')),
  video_url text check (video_url is null or video_url ~ '^https://'),
  created_at timestamptz not null default now(),
  constraint gallery_video_has_url check (type = 'image' or video_url is not null)
);

create index gallery_items_tanggal_idx on public.gallery_items (tanggal desc);

alter table public.gallery_items enable row level security;

create policy "gallery: public read" on public.gallery_items
  for select to anon, authenticated using (true);

create policy "gallery: admin write" on public.gallery_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.gallery_items to anon, authenticated;
grant insert, update, delete on public.gallery_items to authenticated;

-- Short clips, uploaded straight from the browser through signed URLs.
-- 50 MB is the per-file ceiling on the free plan.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('video', 'video', true, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- What the site showed before the gallery moved here (placeholders the
-- admins replace with the club's own photos).
insert into public.gallery_items (id, src, alt, caption, tanggal, kategori, width, height, type, video_url) values
  ('g-01', 'https://picsum.photos/seed/ksp-galeri-01/1200/800', 'Peserta workshop pengenalan bahasa C duduk berkelompok menghadap laptop di ruang kelas', 'Workshop perdana semester ganjil, 42 peserta dan satu proyektor yang sempat mati.', '2025-09-12', 'workshop', 1200, 800, 'image', null),
  ('g-02', 'https://picsum.photos/seed/ksp-galeri-02/800/1000', 'Seorang tentor menulis diagram pointer di papan tulis putih', 'Reza menjelaskan kenapa pointer bukan alamat rumah, tapi alamat kotak pos.', '2025-09-19', 'kelas', 800, 1000, 'image', null),
  ('g-03', 'https://picsum.photos/seed/ksp-galeri-03/1000/1000', 'Layar laptop menampilkan terminal dengan keluaran kompilasi gcc', 'Sesi pertama yang berhasil kompilasi tanpa warning. Sorak kecil di ruang FTI 3.2.', '2025-09-26', 'kelas', 1000, 1000, 'image', null),
  ('g-04', 'https://picsum.photos/seed/ksp-galeri-04/1200/675', 'Ruang laboratorium komputer penuh peserta saat sesi latihan bersama', 'Latihan bersama menjelang challenge minggu ketiga.', '2025-10-03', 'kelas', 1200, 675, 'image', null),
  ('g-05', 'https://picsum.photos/seed/ksp-galeri-05/900/1200', 'Dua anggota berdiskusi sambil menunjuk baris kode di layar', 'Debugging berdua selalu lebih cepat daripada menatap layar sendirian.', '2025-10-10', 'kelas', 900, 1200, 'image', null),
  ('g-06', 'https://picsum.photos/seed/ksp-galeri-06/1200/800', 'Papan tulis penuh coretan diagram linked list dan panah antar simpul', 'Papan setelah sesi linked list. Tidak ada yang berani menghapusnya sampai besok.', '2025-10-17', 'kelas', 1200, 800, 'image', null),
  ('g-07', 'https://picsum.photos/seed/ksp-galeri-07/1280/720', 'Cuplikan rekaman sesi workshop manajemen memori', 'Rekaman workshop manajemen memori, dari malloc sampai valgrind.', '2025-10-24', 'workshop', 1280, 720, 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
  ('g-08', 'https://picsum.photos/seed/ksp-galeri-08/1000/750', 'Meja panjang berisi laptop, kabel, dan gelas kopi saat sesi malam', 'Sesi malam sebelum deadline. Kopi habis jam sepuluh.', '2025-11-07', 'lainnya', 1000, 750, 'image', null),
  ('g-09', 'https://picsum.photos/seed/ksp-galeri-09/800/1000', 'Peserta mengangkat tangan untuk bertanya di tengah sesi kelas', 'Pertanyaan terbaik minggu itu: kenapa free() tidak membuat pointer jadi NULL?', '2025-11-14', 'kelas', 800, 1000, 'image', null),
  ('g-10', 'https://picsum.photos/seed/ksp-galeri-10/1200/800', 'Suasana kompetisi internal dengan peserta duduk berbaris menghadap komputer', 'Kompetisi internal akhir semester, tiga jam, delapan soal.', '2025-11-28', 'kompetisi', 1200, 800, 'image', null),
  ('g-11', 'https://picsum.photos/seed/ksp-galeri-11/1000/1000', 'Papan peringkat kompetisi ditampilkan di layar besar', 'Papan peringkat sepuluh menit terakhir, masih berubah tiga kali.', '2025-11-28', 'kompetisi', 1000, 1000, 'image', null),
  ('g-12', 'https://picsum.photos/seed/ksp-galeri-12/1200/675', 'Foto bersama seluruh peserta dan panitia kompetisi internal', 'Foto bersama setelah kompetisi. Sebagian masih memikirkan soal nomor tujuh.', '2025-11-28', 'kompetisi', 1200, 675, 'image', null),
  ('g-13', 'https://picsum.photos/seed/ksp-galeri-13/900/1200', 'Anggota kelompok studi makan bersama di rumah makan sederhana', 'Gathering akhir tahun. Tidak ada yang membahas kode selama dua jam penuh.', '2025-12-13', 'gathering', 900, 1200, 'image', null),
  ('g-14', 'https://picsum.photos/seed/ksp-galeri-14/1200/800', 'Permainan kelompok saat acara gathering di ruang terbuka', 'Ternyata tim yang paling cepat menyusun struct juga paling cepat kalah main tebak kata.', '2025-12-13', 'gathering', 1200, 800, 'image', null),
  ('g-15', 'https://picsum.photos/seed/ksp-galeri-15/1000/750', 'Sesi perkenalan anggota baru semester genap di ruang kelas', 'Perkenalan anggota baru semester genap, 27 orang mendaftar.', '2026-02-06', 'workshop', 1000, 750, 'image', null),
  ('g-16', 'https://picsum.photos/seed/ksp-galeri-16/800/1067', 'Tentor mendampingi peserta satu per satu di depan layar', 'Sistem pendampingan satu tentor untuk empat peserta, dipakai sejak semester ini.', '2026-02-20', 'kelas', 800, 1067, 'image', null),
  ('g-17', 'https://picsum.photos/seed/ksp-galeri-17/1280/720', 'Cuplikan rekaman kelas struktur data tentang pohon biner', 'Rekaman kelas struktur data: dari array bertingkat ke pohon biner.', '2026-03-06', 'kelas', 1280, 720, 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'),
  ('g-18', 'https://picsum.photos/seed/ksp-galeri-18/1200/800', 'Workshop file I/O dengan peserta membuka berkas teks di editor', 'Workshop file I/O. Setengah ruangan baru tahu bahwa fopen bisa gagal.', '2026-03-20', 'workshop', 1200, 800, 'image', null),
  ('g-19', 'https://picsum.photos/seed/ksp-galeri-19/1000/1000', 'Peserta menempelkan catatan tempel berisi ide proyek di dinding', 'Sesi curah gagasan proyek akhir. Sebelas ide, empat yang akhirnya jalan.', '2026-04-10', 'workshop', 1000, 1000, 'image', null),
  ('g-20', 'https://picsum.photos/seed/ksp-galeri-20/1200/675', 'Tim KSP berfoto dengan sertifikat setelah lomba pemrograman antar kampus', 'Tim KSP di lomba pemrograman antar kampus se-DIY, peringkat empat dari 31 tim.', '2026-05-09', 'kompetisi', 1200, 675, 'image', null),
  ('g-21', 'https://picsum.photos/seed/ksp-galeri-21/900/1200', 'Anggota mempresentasikan proyek akhir di depan ruangan', 'Presentasi proyek akhir: penyunting teks berbasis terminal, seluruhnya C.', '2026-05-29', 'kelas', 900, 1200, 'image', null),
  ('g-22', 'https://picsum.photos/seed/ksp-galeri-22/1200/800', 'Suasana buka bersama anggota kelompok studi di halaman kampus', 'Buka bersama di halaman FTI, gabungan dengan dua kelompok studi lain.', '2026-03-14', 'gathering', 1200, 800, 'image', null),
  ('g-23', 'https://picsum.photos/seed/ksp-galeri-23/1000/750', 'Peserta baru mengikuti sesi orientasi kelompok studi di awal semester', 'Orientasi anggota baru semester ganjil 2026. Kelas pertama minggu depannya.', '2026-08-28', 'workshop', 1000, 750, 'image', null),
  ('g-24', 'https://picsum.photos/seed/ksp-galeri-24/1200/800', 'Layar besar menampilkan papan peringkat hall of fame challenge mingguan', 'Papan hall of fame diperbarui tiap Senin pagi, dicetak dan ditempel di sekretariat.', '2026-09-14', 'lainnya', 1200, 800, 'image', null)
on conflict (id) do nothing;
