-- ============================================================
-- SETUP: Penyimpanan hasil foto photobox (private, hanya admin
-- yang bisa melihat / mengunduh / menghapus)
-- ============================================================
-- Jalankan SEKALI di Supabase -> SQL Editor. Aman dijalankan
-- berulang kali.

-- Bucket PRIVATE (public = false), maks 5 MB per file, hanya JPEG
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photobox-results', 'photobox-results', false, 5242880, array['image/jpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg'];

-- Tabel catatan foto
create table if not exists public.photo_results (
  id uuid primary key default gen_random_uuid(),
  slug text,
  storage_path text not null,
  created_at timestamptz not null default now()
);
alter table public.photo_results enable row level security;

-- Tamu (tanpa login) hanya boleh MENAMBAH catatan
drop policy if exists "Public can add photo records" on public.photo_results;
create policy "Public can add photo records"
  on public.photo_results for insert
  to anon, authenticated
  with check (true);

-- Hanya admin (sudah login) yang boleh MELIHAT & MENGHAPUS catatan
drop policy if exists "Admin can read photo records" on public.photo_results;
create policy "Admin can read photo records"
  on public.photo_results for select
  to authenticated
  using (true);

drop policy if exists "Admin can delete photo records" on public.photo_results;
create policy "Admin can delete photo records"
  on public.photo_results for delete
  to authenticated
  using (true);

-- Storage: tamu hanya boleh UPLOAD ke bucket ini
drop policy if exists "Public can upload photobox results" on storage.objects;
create policy "Public can upload photobox results"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'photobox-results');

-- Storage: hanya admin yang boleh MELIHAT / MENGUNDUH file
drop policy if exists "Admin can read photobox results" on storage.objects;
create policy "Admin can read photobox results"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photobox-results');

-- Storage: hanya admin yang boleh MENGHAPUS file
drop policy if exists "Admin can delete photobox results" on storage.objects;
create policy "Admin can delete photobox results"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photobox-results');
