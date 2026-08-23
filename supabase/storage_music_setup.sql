-- ============================================================
-- SETUP: Supabase Storage buat file musik latar yang di-upload
-- lewat Dashboard (bukan lagi tempel link Google Drive)
-- ============================================================
-- Jalankan SEKALI di SQL Editor. Aman dijalankan berkali-kali
-- (pakai "on conflict do nothing" dan "drop policy if exists").

-- Buat bucket "music" (tempat nyimpen file mp3), public = true supaya
-- pengunjung halaman ucapan bisa DENGAR musiknya tanpa perlu login
insert into storage.buckets (id, name, public)
values ('music', 'music', true)
on conflict (id) do nothing;

-- Siapa saja boleh BACA/dengar file di bucket ini (perlu, biar musiknya
-- bisa diputar pengunjung publik yang buka halaman ucapan)
drop policy if exists "Public can read music files" on storage.objects;
create policy "Public can read music files"
  on storage.objects for select
  using (bucket_id = 'music');

-- Hanya admin yang sudah login yang boleh UPLOAD file musik baru
drop policy if exists "Authenticated can upload music files" on storage.objects;
create policy "Authenticated can upload music files"
  on storage.objects for insert
  with check (bucket_id = 'music' and auth.role() = 'authenticated');

-- Hanya admin yang boleh GANTI file musik yang sudah ada
drop policy if exists "Authenticated can update music files" on storage.objects;
create policy "Authenticated can update music files"
  on storage.objects for update
  using (bucket_id = 'music' and auth.role() = 'authenticated');

-- Hanya admin yang boleh HAPUS file musik
drop policy if exists "Authenticated can delete music files" on storage.objects;
create policy "Authenticated can delete music files"
  on storage.objects for delete
  using (bucket_id = 'music' and auth.role() = 'authenticated');
