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
  music_url text,                     -- (opsional) link musik latar (mp3) untuk halaman ucapan
  bg_theme text default 'light',       -- Tema latar halaman ucapan: 'light' | 'pastel' | 'sunset' | 'dark'
  created_at timestamptz default now()
);

-- ============================================================
-- UPGRADE dari versi sebelumnya? Baris-baris di bawah ini AMAN
-- dijalankan meski tabelnya sudah ada / kolomnya sudah ada duluan
-- (semua pakai "if not exists", jadi tidak akan error walau di-Run
-- berkali-kali). Kalau tabel baru saja dibuat lewat create table di
-- atas, baris-baris ini otomatis tidak melakukan apa-apa (kolomnya
-- sudah ada semua).
-- ============================================================
alter table birthday_links add column if not exists reveal_style text default 'scratch';
alter table birthday_links add column if not exists font_family text default 'poppins';
alter table birthday_links add column if not exists text_color text default '#374151';
alter table birthday_links add column if not exists accent_color text default '#ec4899';
alter table birthday_links add column if not exists event_date date;
alter table birthday_links add column if not exists music_url text;
alter table birthday_links add column if not exists bg_theme text default 'light';
alter table birthday_links add column if not exists greeting_title text default 'Selamat Ulang Tahun';
alter table birthday_links add column if not exists greeting_emoji text default '🎂🎉';

-- Aktifkan Row Level Security (WAJIB, jangan dilewati)
alter table birthday_links enable row level security;

-- Siapa saja (termasuk pengunjung tanpa login) boleh MEMBACA data.
-- Ini perlu supaya halaman publik /#/ucapan/:slug bisa menampilkan ucapan.
-- (drop dulu kalau sudah ada, supaya baris ini aman di-Run berkali-kali)
drop policy if exists "Public can read birthday_links" on birthday_links;
create policy "Public can read birthday_links"
  on birthday_links for select
  using (true);

-- Hanya user yang SUDAH LOGIN (admin) yang boleh membuat / mengubah / menghapus.
drop policy if exists "Authenticated can manage birthday_links" on birthday_links;
create policy "Authenticated can manage birthday_links"
  on birthday_links for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
