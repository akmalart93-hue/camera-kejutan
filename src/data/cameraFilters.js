/**
 * ============================================================
 * FILTER KAMERA (30 pilihan)
 * ============================================================
 * Tiap filter didefinisikan sebagai CSS filter string — dipakai LANGSUNG
 * di elemen <video> untuk preview live, DAN dipakai di Canvas (ctx.filter)
 * saat foto benar-benar di-capture, supaya efeknya ikut "terbakar" ke
 * hasil akhir (bukan cuma tampilan preview doang).
 *
 * Menambah filter baru: tinggal tambah satu objek baru di array ini.
 */
export const CAMERA_FILTERS = [
  { id: 'normal', name: 'Normal', emoji: '⚪', css: 'none' },
  { id: 'iphone', name: 'iPhone Look', emoji: '✨', css: 'contrast(1.08) saturate(1.18) brightness(1.03)' },
  { id: 'beauty', name: 'Beauty Glow', emoji: '🌸', css: 'brightness(1.14) contrast(0.94) saturate(1.12) blur(0.6px)' },
  { id: 'warm-sunset', name: 'Warm Sunset', emoji: '🌇', css: 'brightness(1.06) saturate(1.22) sepia(0.1) contrast(1.02)' },
  { id: 'soft-pink', name: 'Soft Pink', emoji: '🎀', css: 'brightness(1.1) saturate(1.05) contrast(0.96) hue-rotate(-5deg) blur(0.4px)' },
  { id: 'bw-klasik', name: 'B&W Klasik', emoji: '🎞️', css: 'grayscale(1) contrast(1.15) brightness(1.02)' },
  { id: 'clarendon-bright', name: 'Clarendon Bright', emoji: '☀️', css: 'contrast(1.2) saturate(1.35) brightness(1.05)' },
  { id: 'gingham-fade', name: 'Gingham Fade', emoji: '🌾', css: 'brightness(1.05) sepia(0.2) contrast(0.9) saturate(0.85)' },
  { id: 'moonlight-bw', name: 'Moonlight B&W', emoji: '🌙', css: 'grayscale(1) contrast(1.25) brightness(1.1)' },
  { id: 'lark-airy', name: 'Lark Airy', emoji: '🕊️', css: 'brightness(1.15) saturate(0.9) contrast(1.05)' },
  { id: 'faded-retro', name: 'Faded Retro', emoji: '📼', css: 'sepia(0.3) brightness(1.1) contrast(0.85) saturate(0.75)' },
  { id: 'juno-vivid', name: 'Juno Vivid', emoji: '🔥', css: 'saturate(1.4) contrast(1.1) brightness(1.05) sepia(0.05)' },
  { id: 'dreamy-haze', name: 'Dreamy Haze', emoji: '☁️', css: 'brightness(1.05) saturate(0.7) sepia(0.15) contrast(0.9) blur(0.3px)' },
  { id: 'creamy-soft', name: 'Creamy Soft', emoji: '🍦', css: 'brightness(1.08) sepia(0.12) saturate(0.9) contrast(0.95)' },
  { id: 'punch-contrast', name: 'Punch Contrast', emoji: '💥', css: 'contrast(1.3) saturate(1.15) brightness(1.02)' },
  { id: 'ocean-mist', name: 'Ocean Mist', emoji: '🌊', css: 'saturate(0.85) brightness(1.1) hue-rotate(-10deg) contrast(0.9)' },
  { id: 'pastel-dream', name: 'Pastel Dream', emoji: '🍭', css: 'brightness(1.1) saturate(1.1) contrast(0.92) hue-rotate(5deg)' },
  { id: 'amaro-vintage', name: 'Amaro Vintage', emoji: '🧡', css: 'brightness(1.12) saturate(1.2) contrast(0.95) sepia(0.08)' },
  { id: 'rosy-glow', name: 'Rosy Glow', emoji: '🌹', css: 'saturate(1.15) brightness(1.05) hue-rotate(-3deg) contrast(1.05)' },
  { id: 'golden-rise', name: 'Golden Rise', emoji: '🌅', css: 'brightness(1.15) sepia(0.2) saturate(1.1) contrast(0.95)' },
  { id: 'arctic-cool', name: 'Arctic Cool', emoji: '❄️', css: 'brightness(1.1) contrast(1.15) saturate(1.05) hue-rotate(10deg)' },
  { id: 'valencia-warm', name: 'Valencia Warm', emoji: '🍊', css: 'sepia(0.25) brightness(1.08) saturate(1.15) contrast(0.9)' },
  { id: 'cross-process', name: 'Cross Process', emoji: '🎬', css: 'saturate(1.5) contrast(1.2) brightness(0.95) sepia(0.1)' },
  { id: 'muted-sierra', name: 'Muted Sierra', emoji: '🏜️', css: 'brightness(1.05) saturate(0.8) contrast(0.85) sepia(0.15)' },
  { id: 'warm-mono', name: 'Warm Mono', emoji: '🍂', css: 'grayscale(0.85) sepia(0.15) brightness(1.05) contrast(1.05)' },
  { id: 'neon-pop', name: 'Neon Pop', emoji: '⚡', css: 'saturate(1.6) contrast(1.3) brightness(0.97)' },
  { id: 'inkwell-mono', name: 'Inkwell Mono', emoji: '⬛', css: 'grayscale(1) contrast(1.1) brightness(1.05)' },
  { id: 'vivid-vintage', name: 'Vivid Vintage', emoji: '📻', css: 'saturate(1.3) contrast(1.2) brightness(1.05) sepia(0.1)' },
  { id: 'nashville-pink', name: 'Nashville Pink', emoji: '💗', css: 'sepia(0.2) saturate(1.2) brightness(1.1) hue-rotate(-5deg) contrast(0.9)' },
  { id: 'toasted-warm', name: 'Toasted Warm', emoji: '🍞', css: 'sepia(0.35) saturate(1.3) contrast(1.1) brightness(0.95)' },
]

export const DEFAULT_FILTER_ID = 'beauty'
