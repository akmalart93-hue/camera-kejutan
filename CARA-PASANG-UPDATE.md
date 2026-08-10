# Cara Pasang Update Ini

Update ini menambahkan: galeri pilih frame (9 desain, 3 kategori), alur
jepret foto berkali-kali dengan tombol "Ambil Ulang", dan halaman ucapan
dengan efek scratch card.

## 1. Extract & timpa file

Extract ZIP ini, lalu **salin semua isi foldernya ke folder project kamu**,
timpa file yang sudah ada. Struktur foldernya sudah cocok (src/App.jsx akan
menimpa src/App.jsx yang lama, dst).

File-file ini AMAN ditimpa — project kamu yang lain (`.env`, `package.json`,
`vite.config.js`, dsb) **tidak ikut berubah/ketimpa** karena tidak termasuk
dalam paket ini.

## 2. Hapus 2 file lama yang sudah tidak dipakai

Sistem frame yang lama (satu frame PNG statis) sudah digantikan sistem baru
yang lebih lengkap. Hapus manual 2 hal ini dari folder project kamu (kalau
masih ada):

- `src/utils/mergePhotoWithFrame.js`
- `public/frames/frame1.svg` (boleh hapus seluruh folder `public/frames/`)

Tidak wajib dihapus (tidak akan bikin error kalau dibiarkan, karena tidak
dipakai lagi oleh kode manapun), tapi lebih rapi kalau dihapus.

## 3. Tidak perlu install ulang

Tidak ada package baru yang ditambahkan — `canvas-confetti` sudah ada dari
sebelumnya. Jadi **tidak perlu** `npm install` lagi.

## 4. Jalankan & cek

```bash
npm run dev
```

Alur baru yang bisa dicoba:
1. Buka link ucapan → tombol "Mulai Photobox"
2. Pilih kategori (Aesthetic / Retro / Cute Shapes) → pilih salah satu frame
3. Kamera akan minta foto sebanyak jumlah slot frame tsb, satu-satu,
   dengan opsi "Ambil Ulang" tiap kali sebelum lanjut
4. Halaman hasil menampilkan foto gabungan + tombol download
5. Halaman ucapan: gosok kartu abu-abu untuk membuka pesan + confetti

## 5. Menambah frame baru

Lihat bagian **"9a. Cara Menambah Frame Baru"** di README.md yang sudah
diperbarui — cukup edit `src/data/frames.js`, tidak perlu bikin file gambar.
