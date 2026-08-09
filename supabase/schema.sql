-- ============================================================
-- Jalankan seluruh isi file ini di:
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Tabel utama: menyimpan setiap link ucapan yang dibuat admin
create table if not exists birthday_links (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,          -- ID unik di URL, contoh: budi-a1b2c3d4
  name text not null,                 -- Nama yang berulang tahun
  message text not null,              -- Isi ucapan
  frame_url text,                     -- (opsional) frame custom, kosongkan = pakai default
  created_at timestamptz default now()
);

-- Aktifkan Row Level Security (WAJIB, jangan dilewati)
alter table birthday_links enable row level security;

-- Siapa saja (termasuk pengunjung tanpa login) boleh MEMBACA data.
-- Ini perlu supaya halaman publik /#/ucapan/:slug bisa menampilkan ucapan.
create policy "Public can read birthday_links"
  on birthday_links for select
  using (true);

-- Hanya user yang SUDAH LOGIN (admin) yang boleh membuat / mengubah / menghapus.
create policy "Authenticated can manage birthday_links"
  on birthday_links for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
