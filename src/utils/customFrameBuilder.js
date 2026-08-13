/**
 * ============================================================
 * CUSTOM FRAME BUILDER
 * ============================================================
 * Membuat objek frame "di tempat" (tanpa gambar overlay) berdasarkan
 * pilihan pengguna: jumlah foto, layout, rasio kanvas, warna, dan
 * gaya sudut. Frame yang dihasilkan tetap kompatibel dengan
 * frameRenderer.js (dirender lewat jalur "procedural" yang sama
 * dipakai kalau frame.overlayImage tidak ada).
 */

export const ASPECT_PRESETS = {
  portrait: { id: 'portrait', label: 'Potret', ratioLabel: '2:3', width: 800, height: 1200 },
  square: { id: 'square', label: 'Persegi', ratioLabel: '1:1', width: 800, height: 800 },
  story: { id: 'story', label: 'Story', ratioLabel: '9:16', width: 800, height: 1422 },
}

export const LAYOUTS = {
  strip: { id: 'strip', label: 'Strip Vertikal' },
  grid2: { id: 'grid2', label: 'Grid 2 Kolom' },
}

export const BG_COLOR_PRESETS = [
  '#ffe4f1', '#e0d4fb', '#fed7aa', '#fdf6ec', '#dbeafe', '#dcfce7', '#111111', '#ffffff',
]

function buildStripSlots(count, canvasW, canvasH, rounded, hasCaption) {
  const margin = canvasW * 0.08
  const gap = canvasW * 0.035
  const captionSpace = hasCaption ? canvasH * 0.09 : canvasH * 0.03
  const usableW = canvasW - margin * 2
  const usableH = canvasH - margin * 2 - captionSpace
  const slotH = (usableH - gap * (count - 1)) / count

  return Array.from({ length: count }, (_, i) => ({
    x: margin,
    y: margin + i * (slotH + gap),
    w: usableW,
    h: slotH,
    shape: rounded ? 'rounded' : 'rect',
    radius: rounded ? Math.min(usableW, slotH) * 0.07 : 0,
  }))
}

function buildGridSlots(count, canvasW, canvasH, rounded, hasCaption) {
  const cols = 2
  const rows = Math.ceil(count / cols)
  const margin = canvasW * 0.06
  const gap = canvasW * 0.035
  const captionSpace = hasCaption ? canvasH * 0.09 : canvasH * 0.03
  const usableW = canvasW - margin * 2
  const usableH = canvasH - margin * 2 - captionSpace
  const cellW = (usableW - gap * (cols - 1)) / cols
  const cellH = (usableH - gap * (rows - 1)) / rows

  return Array.from({ length: count }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      x: margin + col * (cellW + gap),
      y: margin + row * (cellH + gap),
      w: cellW,
      h: cellH,
      shape: rounded ? 'rounded' : 'rect',
      radius: rounded ? Math.min(cellW, cellH) * 0.07 : 0,
    }
  })
}

/**
 * @param {object} opts
 * @param {number} opts.shotCount - 1-8
 * @param {'strip'|'grid2'} opts.layout
 * @param {'portrait'|'square'|'story'} opts.aspect
 * @param {string} opts.bgColor - hex
 * @param {boolean} opts.rounded
 * @param {string} opts.caption - opsional, kosongkan kalau tidak perlu
 */
export function buildCustomFrame(opts) {
  const { shotCount, layout, aspect, bgColor, rounded, caption } = opts
  const preset = ASPECT_PRESETS[aspect] || ASPECT_PRESETS.portrait
  const { width, height } = preset
  const hasCaption = Boolean(caption && caption.trim())

  const slots =
    layout === 'grid2'
      ? buildGridSlots(shotCount, width, height, rounded, hasCaption)
      : buildStripSlots(shotCount, width, height, rounded, hasCaption)

  // Kontras warna teks otomatis (putih di bg gelap, gelap di bg terang)
  const isDarkBg = isColorDark(bgColor)
  const textColor = isDarkBg ? '#f9fafb' : '#374151'

  const frame = {
    id: `custom-${Date.now()}`,
    category: 'custom-user',
    name: caption?.trim() || 'Frame Sendiri',
    shotCount,
    canvas: { width, height },
    background: { type: 'solid', color: bgColor },
    slots,
  }

  if (hasCaption) {
    frame.caption = {
      text: caption.trim(),
      y: height - height * 0.035,
      color: textColor,
      font: '700 34px Poppins, sans-serif',
    }
  }

  return frame
}

function isColorDark(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.55
}
