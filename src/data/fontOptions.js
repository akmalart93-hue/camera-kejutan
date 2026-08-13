/**
 * Pilihan font untuk teks ucapan. `cssFamily` dipakai langsung sebagai
 * inline style fontFamily di halaman ucapan publik. Font-nya dimuat
 * lewat Google Fonts di index.html.
 */
export const FONT_OPTIONS = [
  { id: 'poppins', label: 'Poppins', cssFamily: "'Poppins', sans-serif" },
  { id: 'playfair', label: 'Playfair', cssFamily: "'Playfair Display', serif" },
  { id: 'caveat', label: 'Caveat', cssFamily: "'Caveat', cursive" },
  { id: 'pacifico', label: 'Pacifico', cssFamily: "'Pacifico', cursive" },
  { id: 'quicksand', label: 'Quicksand', cssFamily: "'Quicksand', sans-serif" },
  { id: 'dancing', label: 'Dancing Script', cssFamily: "'Dancing Script', cursive" },
]

export const DEFAULT_FONT_ID = 'poppins'

export const getFontFamily = (id) =>
  FONT_OPTIONS.find((f) => f.id === id)?.cssFamily || FONT_OPTIONS[0].cssFamily

// Beberapa warna siap-pakai biar admin gak perlu buka color-picker melulu
export const COLOR_PRESETS = [
  '#374151', // abu gelap (default)
  '#be123c', // merah marun
  '#7c3aed', // ungu
  '#0369a1', // biru
  '#15803d', // hijau
  '#b45309', // coklat/emas
  '#db2777', // pink
  '#000000', // hitam
]

export const DEFAULT_TEXT_COLOR = '#374151'
export const DEFAULT_ACCENT_COLOR = '#ec4899'
