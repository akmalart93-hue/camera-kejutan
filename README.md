# 🎂 Birthday Photobox

Website ucapan ulang tahun interaktif dengan fitur Photobox kamera, dashboard
admin, dan hosting gratis di GitHub Pages. Panduan ini ditulis untuk pemula —
ikuti dari atas ke bawah, jangan ada yang dilompati.

---

## Daftar Isi
1. [Prasyarat](#1-prasyarat)
2. [Setup Database di Supabase](#2-setup-database-di-supabase)
3. [Setup Project di Komputer](#3-setup-project-di-komputer)
4. [Konfigurasi Environment Variables](#4-konfigurasi-environment-variables)
5. [Konfigurasi Base Path untuk GitHub Pages](#5-konfigurasi-base-path-untuk-github-pages)
6. [Coba Jalankan di Lokal](#6-coba-jalankan-di-lokal)
7. [Upload ke GitHub](#7-upload-ke-github)
8. [Deploy ke GitHub Pages](#8-deploy-ke-github-pages)
9. [Cara Pakai Sehari-hari](#9-cara-pakai-sehari-hari)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prasyarat

Install dulu di komputermu (kalau belum ada):

- **Node.js** versi 18 ke atas → [nodejs.org](https://nodejs.org) (pilih versi LTS)
- **Git** → [git-scm.com](https://git-scm.com)
- Akun **GitHub** (gratis)
- Akun **Supabase** (gratis) → [supabase.com](https://supabase.com)

Cek instalasi dengan membuka Terminal / Command Prompt, ketik:
```bash
node -v
git --version
```
Kalau muncul nomor versi, berarti sudah siap.

---

## 2. Setup Database di Supabase

### 2.1 Buat Project Baru
1. Buka [supabase.com](https://supabase.com) → Login → **New Project**.
2. Isi nama project (bebas), buat password database (simpan baik-baik), pilih region terdekat (misal Singapore).
3. Tunggu 1-2 menit sampai project selesai dibuat.

### 2.2 Jalankan Skema Database
1. Di sidebar kiri, klik **SQL Editor** → **New Query**.
2. Buka file `supabase/schema.sql` yang ada di folder project ini, **copy semua isinya**.
3. Paste ke SQL Editor, lalu klik **Run**.
4. Kalau berhasil, akan muncul tabel `birthday_links` di menu **Table Editor**.

### 2.3 Buat Akun Admin (Kamu Sendiri)
Website ini **tidak punya halaman daftar (sign up)** — ini sengaja, supaya
orang lain tidak bisa membuat akun admin sembarangan. Kamu membuat akun admin
langsung dari Supabase:

1. Di sidebar, klik **Authentication** → **Users** → **Add user** → **Create new user**.
2. Isi email dan password (ini yang akan kamu pakai login di `/#/admin/login`).
3. Centang **Auto Confirm User** supaya tidak perlu verifikasi email.
4. Klik **Create user**.

### 2.4 Ambil API Keys
1. Klik ikon ⚙️ **Project Settings** → **API**.
2. Catat dua nilai ini (akan dipakai di langkah 4):
   - **Project URL**
   - **anon public key**

---

## 3. Setup Project di Komputer

Kalau kamu menerima project ini sebagai file `.zip`:
```bash
# Ekstrak zip, lalu masuk ke foldernya
cd birthday-photobox

# Install semua dependency (React, Tailwind, Supabase, dll)
npm install
```

Kalau mau mulai dari nol sendiri (opsional, tidak perlu kalau sudah pakai project ini):
```bash
npm create vite@latest birthday-photobox -- --template react
cd birthday-photobox
npm install
npm install @supabase/supabase-js react-router-dom canvas-confetti
npm install -D tailwindcss postcss autoprefixer gh-pages
npx tailwindcss init -p
```

---

## 4. Konfigurasi Environment Variables

1. Di dalam folder project, cari file **`.env.example`**.
2. Duplikat file tersebut, ganti namanya jadi **`.env`**.
3. Isi dengan nilai dari Supabase (langkah 2.4):

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Penting:** File `.env` **JANGAN pernah di-upload ke GitHub** (sudah otomatis
> diabaikan lewat `.gitignore`). Untuk deployment, environment variable akan
> diisi lewat GitHub Secrets — dijelaskan di langkah 8.

---

## 5. Konfigurasi Base Path untuk GitHub Pages

Ini adalah bagian paling sering bikin bingung pemula, jadi baca pelan-pelan.

GitHub Pages meng-host repo kamu di URL seperti ini:
```
https://<username-github>.github.io/<nama-repo>/
```

Perhatikan ada `/<nama-repo>/` di belakang domain — bukan di root (`/`).
Karena itu, Vite perlu tahu "base path" ini supaya semua file CSS/JS/gambar
ter-load dengan benar.

**Buka file `vite.config.js`**, ubah baris `base`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/nama-repo-kamu/',   // ← GANTI SESUAI NAMA REPO GITHUB
})
```

Contoh: kalau nanti repo kamu bernama `ucapan-ultah-adik`, maka:
```js
base: '/ucapan-ultah-adik/',
```

> 💡 Kalau lupa mengganti ini, website akan tampil **blank putih** setelah
> di-deploy (CSS & JS gagal dimuat). Ini penyebab #1 masalah deployment SPA
> di GitHub Pages.

---

## 6. Coba Jalankan di Lokal

```bash
npm run dev
```

Buka browser ke `http://localhost:5173`. Kamu akan diarahkan ke halaman login
admin. Coba login dengan akun yang dibuat di langkah 2.3, lalu buat satu link
ucapan uji coba dari Dashboard.

> 📷 **Soal kamera:** `getUserMedia` (akses kamera) hanya bisa jalan di
> `localhost` atau koneksi **HTTPS**. Saat development di `localhost` ini
> otomatis diizinkan browser. GitHub Pages juga otomatis HTTPS, jadi aman.

---

## 7. Upload ke GitHub

1. Buat repository baru di [github.com/new](https://github.com/new).
   - **Jangan** centang "Add README" (karena project sudah punya).
   - Catat nama repo-nya — harus **sama persis** dengan `base` di `vite.config.js`.

2. Di terminal, dalam folder project:
```bash
git init
git add .
git commit -m "Initial commit: Birthday Photobox"
git branch -M main
git remote add origin https://github.com/<username-kamu>/<nama-repo>.git
git push -u origin main
```

---

## 8. Deploy ke GitHub Pages

Ada dua cara. **Rekomendasi: pakai GitHub Actions** (Cara A) karena otomatis
jalan tiap kali kamu `git push`, dan environment variable disimpan aman
sebagai secret (tidak pernah muncul di kode).

### 🅰️ Cara A — GitHub Actions (Direkomendasikan)

Project ini sudah dilengkapi file `.github/workflows/deploy.yml` yang akan
otomatis build & deploy setiap ada push ke branch `main`.

**Langkah 1 — Tambahkan Secrets:**
1. Buka repo di GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Klik **New repository secret**, tambahkan dua secret ini satu per satu:
   - Name: `VITE_SUPABASE_URL` → Value: (isi dari Supabase Project URL)
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: (isi dari Supabase anon key)

**Langkah 2 — Aktifkan GitHub Pages dengan sumber "GitHub Actions":**
1. Masih di **Settings** → klik **Pages** (di sidebar kiri).
2. Pada bagian **Build and deployment** → **Source**, pilih **GitHub Actions**.

**Langkah 3 — Jalankan Workflow:**
```bash
git add .
git commit -m "Trigger deploy"
git push
```
Buka tab **Actions** di repo GitHub kamu, tunggu proses build selesai
(muncul ✅ hijau). Setelah itu website sudah live di:
```
https://<username-kamu>.github.io/<nama-repo>/
```

### 🅱️ Cara B — Manual dengan Package `gh-pages`

Kalau kamu lebih suka deploy manual dari komputer sendiri:

```bash
npm run deploy
```

Perintah ini akan otomatis:
1. Menjalankan `npm run build` (membuat folder `dist`)
2. Mem-push isi folder `dist` ke branch `gh-pages`

Lalu di GitHub: **Settings** → **Pages** → **Source**, pilih branch
**`gh-pages`** dan folder **`/ (root)`** → **Save**.

> ⚠️ Catatan Cara B: environment variable dari `.env` akan ikut ter-bundle
> ke dalam file JS hasil build di komputermu sendiri saat build lokal — ini
> tetap aman selama kamu tidak meng-commit file `.env` itu sendiri ke Git.

---

## 9. Cara Pakai Sehari-hari

1. Buka `https://<username>.github.io/<repo>/#/admin/login`, login.
2. Di Dashboard, isi **nama** yang berulang tahun + **pesan** ucapan → **Buat Link**.
3. Klik **Salin Link** di daftar link, lalu kirim link tersebut (WA, dsb).
4. Saat dibuka, penerima akan diminta akses kamera, ambil foto photobox,
   lalu melihat ucapanmu lengkap dengan confetti. 🎉

Setiap link punya ID unik (slug), jadi kamu bisa membuat link baru untuk
setiap orang tanpa perlu mengubah kode sama sekali.

---

## 10. Troubleshooting

| Masalah | Penyebab & Solusi |
|---|---|
| Halaman putih blank setelah deploy | `base` di `vite.config.js` tidak sesuai nama repo. Perbaiki, lalu deploy ulang. |
| Kamera tidak bisa dibuka | Pastikan diakses lewat **HTTPS** (GitHub Pages sudah HTTPS otomatis) atau `localhost`. Cek juga izin kamera di pengaturan browser/HP. |
| Login admin gagal terus | Pastikan user sudah dibuat di Supabase Authentication dan **Auto Confirm User** dicentang saat membuat user. |
| Data tidak muncul di halaman publik | Cek RLS Policy di Supabase — pastikan policy "Public can read" untuk `select` sudah aktif (lihat `supabase/schema.sql`). |
| GitHub Actions gagal (merah ❌) | Buka tab Actions → klik run yang gagal → baca log error. Biasanya karena Secrets belum diisi di langkah 8A. |
| Link `#/ucapan/xxx` menampilkan "tidak ditemukan" | Slug di URL tidak cocok dengan data di database. Salin ulang link dari Dashboard, jangan diketik manual. |
| Foto hasil download terbalik / ke-crop aneh | Frame di `public/frames/frame1.svg` didesain rasio 1:1 (persegi). Kalau ganti frame custom, pastikan juga rasio persegi. |

---

## Struktur Proyek (Ringkasan)

```
birthday-photobox/
├── .github/workflows/deploy.yml   ← Auto-deploy via GitHub Actions
├── public/frames/frame1.svg       ← Frame photobox (bisa diganti gambar sendiri)
├── supabase/schema.sql            ← Skema database, jalankan di SQL Editor
├── src/
│   ├── lib/supabase.js            ← Koneksi ke Supabase
│   ├── hooks/useBirthdayLink.js   ← Ambil data ucapan by slug
│   ├── utils/mergePhotoWithFrame.js ← Logic Canvas: gabung foto + frame
│   ├── components/AdminRoute.jsx  ← Proteksi halaman admin
│   ├── pages/admin/               ← Login & Dashboard (CRUD)
│   ├── pages/public/              ← Landing (kamera), Result (photobox), Wishes (ucapan+confetti)
│   └── App.jsx                    ← HashRouter + semua routing
├── vite.config.js                 ← base path GitHub Pages
└── .env                           ← Kredensial Supabase (jangan di-commit!)
```

Selamat membuat kejutan untuk orang-orang tersayang! 🎁
