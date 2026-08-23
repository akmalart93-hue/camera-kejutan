/**
 * Tema latar untuk halaman ucapan publik (Wishes.jsx). Admin bebas pilih
 * dari Dashboard — UI interaksi (scratch/balon/amplop) dan tata letaknya
 * tetap sama persis, cuma nuansa warnanya yang beda. Tiap tema juga bawa
 * warna teks judul/hint yang kontrasnya sudah disesuaikan (terang di
 * tema gelap, gelap di tema terang) biar tetap kebaca jelas.
 */
export const BG_THEMES = [
  {
    id: 'light',
    label: 'Cerah',
    emoji: '☀️',
    preview: 'linear-gradient(135deg,#fefce8,#fce7f3,#f3e8ff)',
    pageClass: 'bg-gradient-to-b from-yellow-50 via-pink-50 to-purple-100',
    headingColor: '#1f2937',
    hintColor: '#6b7280',
  },
  {
    id: 'pastel',
    label: 'Pastel',
    emoji: '🌸',
    preview: 'linear-gradient(135deg,#dbeafe,#fce7f3,#ede9fe)',
    pageClass: 'bg-gradient-to-b from-blue-50 via-pink-50 to-purple-50',
    headingColor: '#374151',
    hintColor: '#6b7280',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    emoji: '🌇',
    preview: 'linear-gradient(135deg,#fed7aa,#fecaca,#fbcfe8)',
    pageClass: 'bg-gradient-to-b from-orange-100 via-red-100 to-pink-100',
    headingColor: '#7c2d12',
    hintColor: '#9a3412',
  },
  {
    id: 'dark',
    label: 'Malam',
    emoji: '🌙',
    preview: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)',
    pageClass: 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-900',
    headingColor: '#f9fafb',
    hintColor: '#c4b5fd',
  },
]

export const DEFAULT_BG_THEME_ID = 'light'

export const getBgTheme = (id) => BG_THEMES.find((t) => t.id === id) || BG_THEMES[0]
