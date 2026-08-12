/**
 * ============================================================
 * FRAME RENDERER — Mesin penggambar frame Photobox via Canvas
 * ============================================================
 * Alih-alih pakai gambar PNG frame yang digambar manual satu-satu,
 * setiap frame didefinisikan sebagai DATA (lihat src/data/frames.js):
 * ukuran kanvas, warna latar, posisi & BENTUK tiap slot foto (kotak,
 * bulat, hati, beruang, kucing), serta dekorasi (bintang, titik,
 * daun, dst). File ini yang menerjemahkan data itu jadi gambar akhir.
 *
 * Keuntungan pendekatan ini: menambah frame baru = menambah data baru
 * di frames.js, TANPA perlu bikin aset gambar baru atau ubah kode ini.
 */

// ---------- Helper: memuat gambar sebagai Promise ----------
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// ---------- Helper: gambar image dengan crop "cover" (tidak gepeng) ----------
function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height
  const targetRatio = w / h
  let sx, sy, sWidth, sHeight

  if (imgRatio > targetRatio) {
    sHeight = img.height
    sWidth = sHeight * targetRatio
    sx = (img.width - sWidth) / 2
    sy = 0
  } else {
    sWidth = img.width
    sHeight = sWidth / targetRatio
    sx = 0
    sy = (img.height - sHeight) / 2
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h)
}

// ============================================================
// BENTUK SLOT — tiap fungsi membangun "path" clip di canvas
// ============================================================

function rectPath(ctx, x, y, w, h) {
  ctx.beginPath()
  ctx.rect(x, y, w, h)
}

function roundedRectPath(ctx, x, y, w, h, r = 24) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function circlePath(ctx, x, y, w, h) {
  ctx.beginPath()
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
}

// Kepala bulat + 2 telinga bulat di atas = siluet beruang
function bearPath(ctx, x, y, w, h) {
  const cx = x + w / 2
  const cy = y + h / 2 + h * 0.06
  const headR = Math.min(w, h) / 2 * 0.82
  const earR = headR * 0.42
  const earOffX = headR * 0.78
  const earOffY = headR * 0.78

  ctx.beginPath()
  ctx.arc(cx, cy, headR, 0, Math.PI * 2)
  ctx.moveTo(cx - earOffX + earR, cy - earOffY)
  ctx.arc(cx - earOffX, cy - earOffY, earR, 0, Math.PI * 2)
  ctx.moveTo(cx + earOffX + earR, cy - earOffY)
  ctx.arc(cx + earOffX, cy - earOffY, earR, 0, Math.PI * 2)
}

// Kepala bulat + 2 telinga segitiga lancip = siluet kucing.
// Titik alas tiap telinga ditempatkan TEPAT di garis lingkaran kepala
// (pakai koordinat polar) supaya menyatu mulus, lalu ujungnya runcing
// ke luar — bukan saling menyilang ke tengah.
function catPath(ctx, x, y, w, h) {
  const cx = x + w / 2
  const cy = y + h / 2 + h * 0.08
  const headR = Math.min(w, h) / 2 * 0.78

  ctx.beginPath()
  ctx.arc(cx, cy, headR, 0, Math.PI * 2)

  const pointOnCircle = (angleDeg, radius = headR) => {
    const rad = (angleDeg * Math.PI) / 180
    return [cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius]
  }

  // telinga kiri: 2 titik alas menempel di lingkaran (sudut 215°-255°),
  // 1 titik ujung runcing sedikit di luar lingkaran (sudut 235°)
  const [lax, lay] = pointOnCircle(215)
  const [lbx, lby] = pointOnCircle(255)
  const [ltx, lty] = pointOnCircle(235, headR * 1.55)
  ctx.moveTo(lax, lay)
  ctx.lineTo(ltx, lty)
  ctx.lineTo(lbx, lby)
  ctx.closePath()

  // telinga kanan (cermin dari kiri)
  const [rax, ray] = pointOnCircle(-35)
  const [rbx, rby] = pointOnCircle(-75)
  const [rtx, rty] = pointOnCircle(-55, headR * 1.55)
  ctx.moveTo(rax, ray)
  ctx.lineTo(rtx, rty)
  ctx.lineTo(rbx, rby)
  ctx.closePath()
}

// Bentuk hati memakai kurva parametrik klasik, dinormalisasi ke bounding box
function heartPath(ctx, x, y, w, h) {
  const steps = 60
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const hx = 16 * Math.pow(Math.sin(t), 3)
    const hy =
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    pts.push([hx, -hy])
  }
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scaleX = w / (maxX - minX)
  const scaleY = h / (maxY - minY)

  ctx.beginPath()
  pts.forEach(([px, py], i) => {
    const cx = x + (px - minX) * scaleX
    const cy = y + (py - minY) * scaleY
    if (i === 0) ctx.moveTo(cx, cy)
    else ctx.lineTo(cx, cy)
  })
  ctx.closePath()
}

const SHAPE_BUILDERS = {
  rect: rectPath,
  rounded: (ctx, x, y, w, h, slot) => roundedRectPath(ctx, x, y, w, h, slot.radius),
  circle: circlePath,
  bear: bearPath,
  cat: catPath,
  heart: heartPath,
}

function buildSlotPath(ctx, slot) {
  const builder = SHAPE_BUILDERS[slot.shape] || rectPath
  builder(ctx, slot.x, slot.y, slot.w, slot.h, slot)
}

// ============================================================
// DEKORASI — elemen kecil yang ditaburkan di atas frame
// ============================================================

function drawDot(ctx, { x, y, r, color }) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function drawStar(ctx, { x, y, size, color, rotation = 0 }) {
  const spikes = 5
  const outerR = size
  const innerR = size * 0.45
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    const px = Math.cos(angle) * r
    const py = Math.sin(angle) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function drawHeartDecor(ctx, { x, y, size, color }) {
  heartPath(ctx, x - size / 2, y - size / 2, size, size)
  ctx.fillStyle = color
  ctx.fill()
}

function drawTape(ctx, { x, y, w, h, color, rotation = 0 }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.globalAlpha = 0.8
  ctx.fillStyle = color
  ctx.fillRect(-w / 2, -h / 2, w, h)
  ctx.restore()
}

function drawLeaf(ctx, { x, y, size, color, rotation = 0 }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.beginPath()
  ctx.ellipse(0, 0, size, size * 0.42, 0, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function drawPaw(ctx, { x, y, size, color }) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.55, size * 0.42, 0, 0, Math.PI * 2)
  ctx.fill()
  const toeOffsets = [
    [-size * 0.5, -size * 0.55],
    [-size * 0.15, -size * 0.75],
    [size * 0.15, -size * 0.75],
    [size * 0.5, -size * 0.55],
  ]
  toeOffsets.forEach(([ox, oy]) => {
    ctx.beginPath()
    ctx.arc(x + ox, y + oy, size * 0.2, 0, Math.PI * 2)
    ctx.fill()
  })
}

function drawStripeBand(ctx, { y, height, color, canvasWidth }) {
  ctx.fillStyle = color
  ctx.fillRect(0, y, canvasWidth, height)
}

function drawSprocketColumn(ctx, { side, color, canvasWidth, canvasHeight, count = 12 }) {
  const holeW = 20
  const holeH = 30
  const xPos = side === 'left' ? 22 : canvasWidth - 22 - holeW
  const gap = canvasHeight / count
  for (let i = 0; i < count; i++) {
    const y = gap * i + gap / 2 - holeH / 2
    roundedRectPath(ctx, xPos, y, holeW, holeH, 6)
    ctx.fillStyle = color
    ctx.fill()
  }
}

const DECORATION_DRAWERS = {
  dot: drawDot,
  star: drawStar,
  heart: drawHeartDecor,
  tape: drawTape,
  leaf: drawLeaf,
  paw: drawPaw,
  stripe: drawStripeBand,
  'sprocket-column': drawSprocketColumn,
}

function drawDecoration(ctx, d, canvasWidth, canvasHeight) {
  const drawer = DECORATION_DRAWERS[d.type]
  if (drawer) drawer(ctx, { ...d, canvasWidth, canvasHeight })
}

// ============================================================
// BACKGROUND
// ============================================================

function drawBackground(ctx, frame) {
  const { width, height } = frame.canvas
  const bg = frame.background
  if (bg.type === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, bg.direction === 'vertical' ? 0 : width, bg.direction === 'vertical' ? height : 0)
    g.addColorStop(0, bg.from)
    g.addColorStop(1, bg.to)
    ctx.fillStyle = g
  } else {
    ctx.fillStyle = bg.color || '#ffffff'
  }
  ctx.fillRect(0, 0, width, height)
}

// ============================================================
// FUNGSI UTAMA — panggil ini dari halaman React
// ============================================================

/**
 * Menggambar frame lengkap dengan foto-foto di dalamnya.
 *
 * @param {object} frame - salah satu objek dari src/data/frames.js
 * @param {string[]} photoDataUrls - array dataURL foto (urutan sesuai frame.slots).
 *   Boleh kosong/undefined untuk membuat PREVIEW tanpa foto asli (dipakai di galeri).
 * @returns {Promise<string>} dataURL PNG hasil akhir
 */
export async function renderFrameComposite(frame, photoDataUrls = []) {
  const canvas = document.createElement('canvas')
  canvas.width = frame.canvas.width
  canvas.height = frame.canvas.height
  const ctx = canvas.getContext('2d')

  // ============================================================
  // MODE GAMBAR ASLI — frame.overlayImage ada isinya berarti ini
  // frame hasil upload user (PNG dengan lubang transparan), bukan
  // yang digambar procedural. Foto ditaruh di posisi slot (cover-fit,
  // dipotong sesuai bentuk), lalu gambar overlay-nya ditumpuk di atas —
  // bagian transparan di overlay itulah yang menampakkan fotonya.
  // ============================================================
  if (frame.overlayImage) {
    const images = await Promise.all(
      frame.slots.map((_, i) => (photoDataUrls[i] ? loadImage(photoDataUrls[i]) : null))
    )

    frame.slots.forEach((slot, i) => {
      const img = images[i]
      ctx.save()
      buildSlotPath(ctx, slot)
      ctx.clip()
      if (img) {
        drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h)
      } else {
        // Placeholder abu lembut dipakai untuk preview di galeri (belum ada foto)
        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h)
      }
      ctx.restore()
    })

    const overlay = await loadImage(frame.overlayImage)
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/png')
  }

  // ============================================================
  // MODE PROCEDURAL — frame digambar penuh lewat kode (lihat frames.js
  // versi lama / bawaan sistem)
  // ============================================================
  drawBackground(ctx, frame)

  // Dekorasi lapisan belakang (misal garis-garis sunset di belakang foto)
  ;(frame.backgroundDecorations || []).forEach((d) =>
    drawDecoration(ctx, d, canvas.width, canvas.height)
  )

  // Muat semua foto yang tersedia lebih dulu
  const images = await Promise.all(
    frame.slots.map((_, i) => (photoDataUrls[i] ? loadImage(photoDataUrls[i]) : null))
  )

  frame.slots.forEach((slot, i) => {
    const img = images[i]
    const rotation = slot.rotation || 0
    const cx = slot.x + slot.w / 2
    const cy = slot.y + slot.h / 2

    ctx.save()
    if (rotation) {
      ctx.translate(cx, cy)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-cx, -cy)
    }

    buildSlotPath(ctx, slot)
    ctx.clip()

    if (img) {
      drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h)
    } else {
      // Placeholder lembut dipakai untuk preview di galeri (belum ada foto)
      const g = ctx.createLinearGradient(slot.x, slot.y, slot.x + slot.w, slot.y + slot.h)
      g.addColorStop(0, 'rgba(255,255,255,0.65)')
      g.addColorStop(1, 'rgba(255,255,255,0.3)')
      ctx.fillStyle = g
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h)
    }
    ctx.restore()

    // Garis tepi tipis biar rapi
    ctx.save()
    if (rotation) {
      ctx.translate(cx, cy)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-cx, -cy)
    }
    buildSlotPath(ctx, slot)
    ctx.lineWidth = 6
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.stroke()
    ctx.restore()
  })

  // Dekorasi lapisan depan (bintang, titik, pita washi, dll)
  ;(frame.decorations || []).forEach((d) => drawDecoration(ctx, d, canvas.width, canvas.height))

  if (frame.caption) {
    ctx.font = frame.caption.font || '700 40px Poppins, sans-serif'
    ctx.fillStyle = frame.caption.color || '#333333'
    ctx.textAlign = 'center'
    ctx.fillText(frame.caption.text, canvas.width / 2, frame.caption.y)
  }

  return canvas.toDataURL('image/png')
}
