# 🎉 Ucapan & Photobox

Website ucapan interaktif untuk **momen apa saja** — ulang tahun,
pernikahan, wisuda, kelahiran, atau acara apapun yang kamu mau — lengkap
dengan fitur **Photobox** (kamera + frame + filter), dan **Dashboard Admin**
buat mengatur semuanya tanpa perlu edit kode. Hosting-nya gratis lewat
GitHub Pages. Panduan ini ditulis untuk pemula — ikuti dari atas ke bawah,
jangan ada yang dilompati.

Website ini bukan cuma buat satu jenis acara — dari Dashboard, kamu bisa
atur judul ucapan ("Selamat Ulang Tahun", "Happy Wedding", "Selamat
Wisuda", atau bebas ketik sendiri), nama penerima, isi pesan, font, warna,
sampai kapan link-nya boleh dibuka. Satu website, dipakai berkali-kali
untuk acara apa saja.

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
10. [Semua Fitur, Dijelaskan Satu-satu](#10-semua-fitur-dijelaskan-satu-satu)
11. [Menambah Frame Sendiri (Gambar)](#11-menambah-frame-sendiri-gambar)
12. [Troubleshooting](#12-troubleshooting)

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
   (Nama tabelnya masih `birthday_links` dari versi awal, tapi isinya sekarang
   generik untuk acara apa saja — lihat kolom `greeting_title`.)

> Kalau kamu meng-upgrade dari versi project yang lebih lama (tabelnya
> sudah ada duluan), jangan jalankan ulang `create table`-nya — cukup
> jalankan baris-baris `alter table ... add column if not exists ...` yang
> ada di bagian bawah file `schema.sql`. Detailnya ada di komentar file itu.

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

# Install semua dependency (React, Tailwind, Supabase, QR Code, dll)
npm install
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

Contoh: kalau nanti repo kamu bernama `ucapan-interaktif`, maka:
```js
base: '/ucapan-interaktif/',
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
git commit -m "Initial commit"
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

```bash
npm run deploy
```
Ini otomatis `npm run build` lalu push folder `dist` ke branch `gh-pages`.
Lalu di GitHub: **Settings** → **Pages** → **Source**, pilih branch
**`gh-pages`** dan folder **`/ (root)`** → **Save**.

---

## 9. Cara Pakai Sehari-hari

1. Buka `https://<username>.github.io/<repo>/#/admin/login`, login.
2. Di Dashboard:
   - Klik salah satu **preset jenis acara** (Ulang Tahun / Pernikahan /
     Wisuda / Kelahiran / Umum) — ini otomatis isi judul & emoji, tapi
     kamu bebas edit lagi manual.
   - Isi **nama penerima** dan **pesan**.
   - Atur **font**, **warna teks**, **warna judul**.
   - Pilih **gaya buka pesan** (Scratch Card / Tap Balon / Langsung).
   - (Opsional) set **tanggal** kalau mau link-nya baru bisa dibuka mulai
     hari tertentu (misal: dibuat H-3, tapi baru bisa dibuka pas hari-H).
   - Lihat **live preview** di sebelahnya berubah real-time sesuai pengaturan.
   - Klik **Buat Link**.
3. Di daftar link, klik **Salin Link** (untuk dikirim lewat chat) atau
   **QR Code** (untuk di-download & ditempel di kartu fisik / undangan).
4. Penerima buka link/scan QR-nya, lalu melalui alur:
   sapaan → **pilih frame** (33 desain siap pakai, atau **buat frame
   sendiri** bebas atur jumlah foto & ukurannya) → **pilih filter kamera**
   → jepret foto sejumlah slot frame (bisa **ganti kamera depan/belakang**,
   bisa **ambil ulang** tiap foto) → lihat hasil gabungan & download →
   buka pesan sesuai gaya interaksi yang kamu pilih, lengkap dengan confetti.

Setiap link punya ID unik (slug), jadi kamu bisa membuat link baru untuk
setiap acara/orang tanpa perlu mengubah kode sama sekali.

---

## 10. Semua Fitur, Dijelaskan Satu-satu

### 🎨 33 Frame Siap Pakai + Frame Builder Bebas
Galeri berisi 33 desain frame (gaya Y2K, retro, aesthetic, dst) dengan
jumlah foto bervariasi (1-4 slot). Kalau mau lebih bebas, ada tombol
**"Buat Frame Sendiri"** di galeri — bisa atur sendiri: jumlah foto (1-8),
layout (strip vertikal / grid 2 kolom), rasio (potret/persegi/story),
warna latar, dan sudut kotak/membulat. Tidak terpaku template.

### 🎞️ 30 Filter Kamera
Dipilih langsung sebelum motret, efeknya ikut "terbakar" ke hasil foto
(bukan cuma preview). Ada gaya natural, beauty/glowy, B&W, vintage, sampai
yang vivid/kontras tinggi.

### 🔄 Kamera Depan/Belakang + Ambil Ulang
Ada tombol switch kamera (berguna di HP), dan tiap habis jepret ada
pilihan "Ambil Ulang" sebelum foto itu dipakai — jadi tidak perlu mulai
dari awal kalau hasilnya kurang pas.

### ✍️ Font & Warna Custom
Pilih dari beberapa font (termasuk gaya tulisan tangan/script) dan warna
teks + warna judul, semuanya lewat Dashboard, tanpa sentuh kode.

### 🎈 3 Gaya Buka Pesan
- **Scratch Card** — digosok pakai jari
- **Tap Balon** — pecahkan semua balon dulu
- **Langsung** — tanpa interaksi, langsung tampil + confetti

### 🔒 Kunci Tanggal
Set tanggal di Dashboard supaya link baru bisa dibuka penerima mulai
tanggal itu — cocok kalau kamu mau siapkan link jauh-jauh hari tapi baru
mau dibuka pas hari-H.

### 📱 QR Code
Tiap link otomatis bisa di-generate jadi gambar QR (di-download), buat
ditempel di kartu ucapan fisik atau undangan cetak — bukan cuma dikirim
sebagai link digital.

---

## 11. Menambah Frame Sendiri (Gambar)

Selain "Buat Frame Sendiri" yang otomatis (lihat fitur di atas), kamu juga
bisa menambah frame dari **gambar PNG buatan sendiri** (didesain di Canva,
Photoshop, dll) ke galeri utama:

### Langkah singkat:
1. Desain frame-mu dengan bagian tempat foto **dibiarkan transparan**
   (PNG dengan alpha channel).
2. Taruh file-nya di `public/frames-custom/`.
3. Buka `src/data/frames.js`, tambah satu objek baru di array `FRAMES`:

```js
{
  id: 'frame-baru-saya',
  category: 'custom',
  name: 'Nama Frame Saya',
  shotCount: 3, // sesuai jumlah lubang transparan
  canvas: { width: 1000, height: 1500 }, // sesuai ukuran gambar aslimu
  overlayImage: `${BASE}frames-custom/frame-baru-saya.png`,
  thumbnail: `${BASE}frames-custom/thumbs/frame-baru-saya.jpg`, // versi kecil, opsional
  slots: [
    { x: 100, y: 100, w: 800, h: 400, shape: 'rect' }, // koordinat lubang ke-1
    { x: 100, y: 550, w: 800, h: 400, shape: 'rect' }, // koordinat lubang ke-2
    { x: 100, y: 1000, w: 800, h: 400, shape: 'rect' }, // koordinat lubang ke-3
  ],
},
```

4. Koordinat `x, y, w, h` itu posisi & ukuran tiap lubang transparan, dalam
   satuan piksel gambar aslimu (bukan piksel layar). Cara termudah cari
   angkanya: buka gambarmu di editor (Photoshop/GIMP/Figma), lihat posisi
   & ukuran tiap kotak seleksi area transparan.
5. Simpan file. Frame baru otomatis muncul di galeri.

> 💡 Tidak punya waktu bikin thumbnail kecil sendiri? Boleh pakai gambar
> full-res yang sama di `thumbnail` juga (cuma lebih berat dimuat di
> galeri) — atau hapus baris `thumbnail` sama sekali, nanti sistem akan
> coba render preview dari `overlayImage` langsung.

---

## 12. Troubleshooting

| Masalah | Penyebab & Solusi |
|---|---|
| Halaman putih blank setelah deploy | `base` di `vite.config.js` tidak sesuai nama repo. Perbaiki, lalu deploy ulang. |
| Kamera tidak bisa dibuka | Pastikan diakses lewat **HTTPS** (GitHub Pages sudah HTTPS otomatis) atau `localhost`. Cek juga izin kamera di pengaturan browser/HP. |
| Login admin gagal terus | Pastikan user sudah dibuat di Supabase Authentication dan **Auto Confirm User** dicentang saat membuat user. |
| Data tidak muncul di halaman publik | Cek RLS Policy di Supabase — pastikan policy "Public can read" untuk `select` sudah aktif (lihat `supabase/schema.sql`). |
| GitHub Actions gagal (merah ❌) | Buka tab Actions → klik run yang gagal → baca log error. Biasanya karena Secrets belum diisi di langkah 8A. |
| Link `#/ucapan/xxx` menampilkan "tidak ditemukan" | Slug di URL tidak cocok dengan data di database. Salin ulang link dari Dashboard, jangan diketik manual. |
| Muncul error soal kolom database (`greeting_title`, `font_family`, dst tidak ada) | Kamu belum jalankan migrasi `alter table` terbaru. Buka `supabase/schema.sql`, jalankan semua baris `alter table ... add column if not exists ...` di SQL Editor. |
| Link terkunci padahal harusnya sudah bisa dibuka | Cek kolom `event_date` link itu di Supabase Table Editor — pastikan tanggalnya sudah lewat/sama dengan hari ini. |
| Font pilihan tidak kelihatan bedanya | Font dimuat dari Google Fonts lewat internet — pastikan koneksi internet penerima aktif saat membuka link. |

---

## Struktur Proyek (Ringkasan)

```
birthday-photobox/
├── .github/workflows/deploy.yml     ← Auto-deploy via GitHub Actions
├── public/frames-custom/            ← 33 gambar frame + thumbnail galeri
├── supabase/schema.sql              ← Skema database, jalankan di SQL Editor
├── src/
│   ├── lib/supabase.js              ← Koneksi ke Supabase
│   ├── hooks/useBirthdayLink.js     ← Ambil data ucapan by slug
│   ├── hooks/useCamera.js           ← Akses kamera + switch depan/belakang
│   ├── data/frames.js               ← Katalog 33 frame (gambar)
│   ├── data/cameraFilters.js        ← 30 filter kamera
│   ├── data/fontOptions.js          ← Pilihan font & warna
│   ├── utils/frameRenderer.js       ← Mesin gabung foto + frame (Canvas)
│   ├── utils/customFrameBuilder.js  ← Generator frame custom on-the-fly
│   ├── components/AdminRoute.jsx    ← Proteksi halaman admin
│   ├── components/ScratchCard.jsx   ← Interaksi gosok
│   ├── components/TapBalloons.jsx   ← Interaksi tap balon
│   ├── pages/admin/                 ← Login & Dashboard (editor + QR)
│   ├── pages/public/                ← Landing, FrameGallery, Capture, Result, Wishes
│   └── App.jsx                      ← HashRouter + semua routing
├── vite.config.js                   ← base path GitHub Pages
└── .env                             ← Kredensial Supabase (jangan di-commit!)
```

Selamat membuat kejutan untuk momen apapun! 🎁
