/**
 * Google Drive share link ("https://drive.google.com/file/d/XXX/view")
 * nggak bisa dipakai langsung sebagai file audio — itu link ke halaman
 * preview, bukan file mentahnya. Ada trik TIDAK RESMI dari Google buat
 * dapetin akses file langsung: https://drive.google.com/uc?export=download&id=FILE_ID
 *
 * Batasan trik ini (penting buat pengguna tahu):
 * - File WAJIB di-share sebagai "Anyone with the link", bukan private.
 * - File di atas ±25MB kadang malah nampilin halaman peringatan "tidak
 *   bisa di-scan virus" alih-alih file-nya langsung -> gagal diputar.
 * - Bisa berhenti berfungsi sewaktu-waktu kalau Google mengubah sistemnya,
 *   karena ini bukan fitur resmi buat hosting publik.
 *
 * Fungsi ini otomatis mendeteksi & mengonversi link share Google Drive
 * biasa ke format itu. Juga menangani: URL langsung (http/https biasa)
 * dan path relatif (file yang di-host sendiri di folder public/).
 */
export function resolveMusicUrl(rawUrl) {
  if (!rawUrl) return null
  const url = rawUrl.trim()
  if (!url) return null

  // Pola link share Google Drive: .../file/d/FILE_ID/view...
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`
  }

  // Sudah dalam format uc?...id=FILE_ID (kalau user paste manual)
  if (url.includes('drive.google.com/uc')) {
    return url
  }

  // URL absolut biasa (http/https, termasuk mp3 hosting lain) -> biarkan apa adanya
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  // Path relatif (file yang di-host sendiri di public/, misal "music/lagu1.mp3")
  // -> digabung dengan base path GitHub Pages biar selalu benar di mana pun
  const base = import.meta.env.BASE_URL
  return `${base}${url.replace(/^\//, '')}`
}
