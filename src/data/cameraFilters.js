/**
 * ============================================================
 * FILTER KAMERA
 * ============================================================
 * Tiap filter didefinisikan sebagai CSS filter string — dipakai LANGSUNG
 * di elemen <video> untuk preview live, DAN dipakai di Canvas (ctx.filter)
 * saat foto benar-benar di-capture, supaya efeknya ikut "terbakar" ke
 * hasil akhir (bukan cuma tampilan preview doang).
 *
 * Menambah filter baru: tinggal tambah satu objek baru di array ini.
 */
export const CAMERA_FILTERS = [
  {
    id: 'normal',
    name: 'Normal',
    emoji: '⚪',
    css: 'none',
  },
  {
    id: 'iphone',
    name: 'iPhone',
    emoji: '✨',
    // Kontras & saturasi sedikit naik, khas hasil kamera iPhone yang "punchy"
    css: 'contrast(1.08) saturate(1.18) brightness(1.03)',
  },
  {
    id: 'beauty',
    name: 'Beauty',
    emoji: '🌸',
    // Kulit lebih cerah & mulus (blur halus), warna sedikit hangat — gaya
    // "beauty cam" yang biasa disukai buat selfie
    css: 'brightness(1.14) contrast(0.94) saturate(1.12) blur(0.6px)',
  },
  {
    id: 'warm',
    name: 'Warm Glow',
    emoji: '🌇',
    css: 'brightness(1.06) saturate(1.22) sepia(0.1) contrast(1.02)',
  },
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    emoji: '🎀',
    css: 'brightness(1.1) saturate(1.05) contrast(0.96) hue-rotate(-5deg) blur(0.4px)',
  },
  {
    id: 'bw',
    name: 'B&W Klasik',
    emoji: '🎞️',
    css: 'grayscale(1) contrast(1.15) brightness(1.02)',
  },
]

export const DEFAULT_FILTER_ID = 'beauty'
