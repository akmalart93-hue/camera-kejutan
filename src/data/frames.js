/**
 * ============================================================
 * KATALOG FRAME PHOTOBOX
 * ============================================================
 * Setiap frame = satu objek data yang menjelaskan: ukuran kanvas,
 * warna latar, bentuk & posisi tiap slot foto, dekorasi, dan caption.
 * frameRenderer.js yang menggambarnya jadi PNG asli.
 *
 * CARA MENAMBAH FRAME BARU (lihat juga README bagian "Menambah Frame"):
 * 1. Duplikat salah satu objek di array FRAMES di bawah.
 * 2. Ganti `id` (harus unik), `name`, `category`, `shotCount`.
 * 3. Atur ulang posisi `slots` (x, y, w, h) sesuai `canvas.width/height`.
 * 4. Simpan file — frame baru otomatis muncul di galeri publik.
 *
 * Bentuk slot yang tersedia: 'rect' | 'rounded' | 'circle' | 'bear' | 'cat' | 'heart'
 * Tipe dekorasi yang tersedia: 'dot' | 'star' | 'heart' | 'tape' | 'leaf' | 'paw' | 'stripe' | 'sprocket-column'
 */

export const FRAME_CATEGORIES = [
  { id: 'aesthetic', name: 'Aesthetic', emoji: '🌸' },
  { id: 'retro', name: 'Retro', emoji: '📼' },
  { id: 'cute', name: 'Cute Shapes', emoji: '🐻' },
]

export const FRAMES = [
  // ================= AESTHETIC =================
  {
    id: 'aesthetic-pastel-cloud',
    category: 'aesthetic',
    name: 'Pastel Cloud',
    shotCount: 3,
    canvas: { width: 800, height: 1400 },
    background: { type: 'gradient', from: '#ffe4f1', to: '#e0d4fb' },
    slots: [
      { x: 80, y: 70, w: 640, h: 380, shape: 'rounded', radius: 28 },
      { x: 80, y: 480, w: 640, h: 380, shape: 'rounded', radius: 28 },
      { x: 80, y: 890, w: 640, h: 380, shape: 'rounded', radius: 28 },
    ],
    decorations: [
      { type: 'dot', x: 70, y: 40, r: 8, color: '#fbcfe8' },
      { type: 'dot', x: 740, y: 55, r: 6, color: '#c4b5fd' },
      { type: 'star', x: 720, y: 1310, size: 16, color: '#fbbf24', rotation: 12 },
      { type: 'star', x: 60, y: 1300, size: 12, color: '#f472b6', rotation: -10 },
    ],
    caption: { text: 'good vibes only ✨', y: 1355, color: '#a855f7', font: '700 42px Poppins, sans-serif' },
  },
  {
    id: 'aesthetic-golden-hour',
    category: 'aesthetic',
    name: 'Golden Hour',
    shotCount: 4,
    canvas: { width: 800, height: 1000 },
    background: { type: 'gradient', from: '#fed7aa', to: '#fecdd3' },
    slots: [
      { x: 70, y: 110, w: 320, h: 320, shape: 'circle' },
      { x: 410, y: 110, w: 320, h: 320, shape: 'circle' },
      { x: 70, y: 460, w: 320, h: 320, shape: 'circle' },
      { x: 410, y: 460, w: 320, h: 320, shape: 'circle' },
    ],
    decorations: [
      { type: 'star', x: 400, y: 60, size: 14, color: '#fbbf24' },
      { type: 'dot', x: 45, y: 430, r: 6, color: '#fdba74' },
      { type: 'dot', x: 755, y: 430, r: 6, color: '#fca5a5' },
      { type: 'star', x: 400, y: 855, size: 12, color: '#f97316', rotation: 20 },
    ],
    caption: { text: 'golden memories', y: 940, color: '#c2410c', font: '700 38px Poppins, sans-serif' },
  },
  {
    id: 'aesthetic-botanical',
    category: 'aesthetic',
    name: 'Botanical Frame',
    shotCount: 5,
    canvas: { width: 800, height: 1700 },
    background: { type: 'solid', color: '#fdf6ec' },
    slots: [
      { x: 60, y: 60, w: 680, h: 260, shape: 'rounded', radius: 20 },
      { x: 60, y: 360, w: 680, h: 260, shape: 'rounded', radius: 20 },
      { x: 60, y: 660, w: 680, h: 260, shape: 'rounded', radius: 20 },
      { x: 60, y: 960, w: 680, h: 260, shape: 'rounded', radius: 20 },
      { x: 60, y: 1260, w: 680, h: 260, shape: 'rounded', radius: 20 },
    ],
    decorations: [
      { type: 'leaf', x: 50, y: 40, size: 30, color: '#86efac', rotation: -20 },
      { type: 'leaf', x: 750, y: 40, size: 30, color: '#4ade80', rotation: 25 },
      { type: 'leaf', x: 50, y: 1590, size: 26, color: '#4ade80', rotation: 15 },
      { type: 'leaf', x: 750, y: 1590, size: 26, color: '#86efac', rotation: -15 },
      { type: 'dot', x: 400, y: 1600, r: 5, color: '#fda4af' },
    ],
    caption: { text: 'bloom & glow 🌿', y: 1650, color: '#15803d', font: '700 40px Poppins, sans-serif' },
  },

  // ================= RETRO =================
  {
    id: 'retro-film-strip',
    category: 'retro',
    name: 'Film Strip 35mm',
    shotCount: 6,
    canvas: { width: 800, height: 1900 },
    background: { type: 'solid', color: '#111111' },
    slots: [
      { x: 120, y: 60, w: 560, h: 260, shape: 'rect' },
      { x: 120, y: 360, w: 560, h: 260, shape: 'rect' },
      { x: 120, y: 660, w: 560, h: 260, shape: 'rect' },
      { x: 120, y: 960, w: 560, h: 260, shape: 'rect' },
      { x: 120, y: 1260, w: 560, h: 260, shape: 'rect' },
      { x: 120, y: 1560, w: 560, h: 260, shape: 'rect' },
    ],
    backgroundDecorations: [
      { type: 'sprocket-column', side: 'left', color: '#e5e5e5' },
      { type: 'sprocket-column', side: 'right', color: '#e5e5e5' },
    ],
    decorations: [],
    caption: { text: 'DEVELOPED — 2026', y: 1860, color: '#f5f5f5', font: "700 32px 'Courier New', monospace" },
  },
  {
    id: 'retro-polaroid-stack',
    category: 'retro',
    name: 'Vintage Polaroid Stack',
    shotCount: 4,
    canvas: { width: 800, height: 1000 },
    background: { type: 'solid', color: '#efe6d8' },
    slots: [
      { x: 90, y: 80, w: 300, h: 340, shape: 'rect', rotation: -8 },
      { x: 420, y: 60, w: 300, h: 340, shape: 'rect', rotation: 6 },
      { x: 110, y: 470, w: 300, h: 340, shape: 'rect', rotation: 5 },
      { x: 430, y: 490, w: 300, h: 340, shape: 'rect', rotation: -6 },
    ],
    decorations: [
      { type: 'tape', x: 170, y: 90, w: 90, h: 34, color: '#fde68a', rotation: -20 },
      { type: 'tape', x: 500, y: 70, w: 90, h: 34, color: '#fca5a5', rotation: 15 },
      { type: 'tape', x: 190, y: 480, w: 90, h: 34, color: '#a5f3fc', rotation: 10 },
      { type: 'tape', x: 510, y: 500, w: 90, h: 34, color: '#d9f99d', rotation: -12 },
    ],
    caption: { text: 'throwback ✨', y: 980, color: '#92400e', font: '700 38px Poppins, sans-serif' },
  },
  {
    id: 'retro-sunset',
    category: 'retro',
    name: 'Retro Sunset',
    shotCount: 3,
    canvas: { width: 800, height: 1400 },
    background: { type: 'gradient', from: '#4c1d95', to: '#f97316', direction: 'vertical' },
    backgroundDecorations: [
      { type: 'stripe', y: 1000, height: 14, color: 'rgba(255,255,255,0.15)' },
      { type: 'stripe', y: 1040, height: 10, color: 'rgba(255,255,255,0.12)' },
      { type: 'stripe', y: 1075, height: 6, color: 'rgba(255,255,255,0.1)' },
    ],
    slots: [
      { x: 100, y: 60, w: 600, h: 380, shape: 'rounded', radius: 8 },
      { x: 100, y: 460, w: 600, h: 380, shape: 'rounded', radius: 8 },
      { x: 100, y: 860, w: 600, h: 380, shape: 'rounded', radius: 8 },
    ],
    decorations: [
      { type: 'dot', x: 400, y: 1250, r: 60, color: 'rgba(253,224,71,0.35)' },
    ],
    caption: { text: 'retro vibes 🌅', y: 1350, color: '#fef3c7', font: '700 42px Poppins, sans-serif' },
  },

  // ================= CUTE SHAPES =================
  {
    id: 'cute-teddy-bear',
    category: 'cute',
    name: 'Teddy Bear',
    shotCount: 3,
    canvas: { width: 800, height: 1500 },
    background: { type: 'solid', color: '#fff1e6' },
    slots: [
      { x: 120, y: 60, w: 560, h: 420, shape: 'bear' },
      { x: 120, y: 500, w: 560, h: 420, shape: 'bear' },
      { x: 120, y: 940, w: 560, h: 420, shape: 'bear' },
    ],
    decorations: [
      { type: 'paw', x: 60, y: 1420, size: 34, color: '#c88b5a' },
      { type: 'paw', x: 740, y: 1420, size: 34, color: '#c88b5a' },
      { type: 'heart', x: 400, y: 30, size: 26, color: '#fda4af' },
    ],
    caption: { text: 'beary happy birthday 🐻', y: 1460, color: '#92400e', font: '700 36px Poppins, sans-serif' },
  },
  {
    id: 'cute-kitty-cat',
    category: 'cute',
    name: 'Kitty Cat',
    shotCount: 3,
    canvas: { width: 800, height: 1500 },
    background: { type: 'solid', color: '#ffe9f3' },
    slots: [
      { x: 120, y: 60, w: 560, h: 420, shape: 'cat' },
      { x: 120, y: 500, w: 560, h: 420, shape: 'cat' },
      { x: 120, y: 940, w: 560, h: 420, shape: 'cat' },
    ],
    decorations: [
      { type: 'paw', x: 60, y: 1420, size: 34, color: '#f472b6' },
      { type: 'paw', x: 740, y: 1420, size: 34, color: '#f472b6' },
      { type: 'star', x: 400, y: 30, size: 20, color: '#c084fc', rotation: 8 },
    ],
    caption: { text: 'meow-velous day 🐱', y: 1460, color: '#be185d', font: '700 36px Poppins, sans-serif' },
  },
  {
    id: 'cute-heart-stars',
    category: 'cute',
    name: 'Heart & Stars',
    shotCount: 4,
    canvas: { width: 800, height: 1000 },
    background: { type: 'gradient', from: '#fecaca', to: '#fbcfe8' },
    slots: [
      { x: 70, y: 100, w: 320, h: 320, shape: 'heart' },
      { x: 410, y: 100, w: 320, h: 320, shape: 'heart' },
      { x: 70, y: 460, w: 320, h: 320, shape: 'heart' },
      { x: 410, y: 460, w: 320, h: 320, shape: 'heart' },
    ],
    decorations: [
      { type: 'star', x: 400, y: 50, size: 16, color: '#facc15' },
      { type: 'star', x: 40, y: 440, size: 12, color: '#f43f5e', rotation: 15 },
      { type: 'star', x: 760, y: 440, size: 12, color: '#f43f5e', rotation: -15 },
      { type: 'star', x: 400, y: 850, size: 14, color: '#facc15', rotation: 30 },
    ],
    caption: { text: "you're a star ⭐", y: 940, color: '#be123c', font: '700 38px Poppins, sans-serif' },
  },
]
