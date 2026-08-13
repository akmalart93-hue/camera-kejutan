-- ============================================================
-- Jalankan seluruh isi file ini di:
-- Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Tabel utama: menyimpan setiap link ucapan yang dibuat admin
-- (nama tabel "birthday_links" adalah penamaan historis dari versi awal;
-- fungsinya sekarang generik untuk acara apa pun — ulang tahun, pernikahan,
-- wisuda, kelahiran, dll — lewat kolom greeting_title & greeting_emoji)
create table if not exists birthday_links (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,          -- ID unik di URL, contoh: budi-a1b2c3d4
  name text not null,                 -- Nama penerima ucapan
  message text not null,              -- Isi ucapan
  greeting_title text default 'Selamat Ulang Tahun', -- Judul besar, contoh: "Happy Wedding"
  greeting_emoji text default '🎂🎉', -- Emoji di judul, contoh: "💍💕"
  frame_url text,                     -- (opsional) frame custom, kosongkan = pakai default
  reveal_style text default 'scratch', -- Gaya buka ucapan: 'scratch' | 'tap-balloons' | 'simple'
  font_family text default 'poppins', -- Font teks ucapan (lihat src/data/fontOptions.js)
  text_color text default '#374151',  -- Warna teks pesan
  accent_color text default '#ec4899', -- Warna judul acara
  event_date date,                    -- (opsional) tanggal acara - kalau diisi,
                                       -- link baru bisa diakses mulai tanggal itu
  created_at timestamptz default now()
);

-- ============================================================
-- UPGRADE dari versi sebelumnya? Kalau tabel birthday_links SUDAH ada
-- (dibuat sebelum kolom-kolom ini ditambahkan), jalankan baris-baris
-- ini SENDIRIAN di SQL Editor (baris create table di atas akan di-skip
-- otomatis karena "if not exists", jadi kolom baru tidak ikut ditambah):
--
--   alter table birthday_links add column if not exists reveal_style text default 'scratch';
--   alter table birthday_links add column if not exists font_family text default 'poppins';
--   alter table birthday_links add column if not exists text_color text default '#374151';
--   alter table birthday_links add column if not exists accent_color text default '#ec4899';
--   alter table birthday_links add column if not exists event_date date;
--   alter table birthday_links add column if not exists greeting_title text default 'Selamat Ulang Tahun';
--   alter table birthday_links add column if not exists greeting_emoji text default '🎂🎉';
-- ============================================================

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
