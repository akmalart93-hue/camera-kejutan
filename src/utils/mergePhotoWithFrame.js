/**
 * Menggabungkan foto hasil jepretan kamera dengan gambar frame (overlay)
 * menjadi satu gambar utuh menggunakan HTML5 Canvas.
 *
 * @param {string} photoDataUrl - dataURL foto mentah (hasil capture video)
 * @param {string} frameUrl - path/URL gambar frame (PNG/SVG transparan di tengah)
 * @param {number} outputSize - lebar & tinggi kanvas output (persegi)
 * @returns {Promise<string>} dataURL gambar PNG hasil gabungan
 */
export function mergePhotoWithFrame(photoDataUrl, frameUrl, outputSize = 1000) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = outputSize
    canvas.height = outputSize
    const ctx = canvas.getContext('2d')

    const photoImg = new Image()
    const frameImg = new Image()
    frameImg.crossOrigin = 'anonymous'

    let loadedCount = 0
    const onBothLoaded = () => {
      loadedCount += 1
      if (loadedCount < 2) return

      // 1. Gambar foto dulu, di-crop "cover" biar penuh & tidak gepeng
      drawImageCover(ctx, photoImg, 0, 0, outputSize, outputSize)

      // 2. Timpa dengan frame di atasnya (frame harus punya area transparan)
      ctx.drawImage(frameImg, 0, 0, outputSize, outputSize)

      resolve(canvas.toDataURL('image/png'))
    }

    photoImg.onload = onBothLoaded
    frameImg.onload = onBothLoaded
    photoImg.onerror = () => reject(new Error('Gagal memuat foto hasil jepretan'))
    frameImg.onerror = () => reject(new Error('Gagal memuat gambar frame'))

    photoImg.src = photoDataUrl
    frameImg.src = frameUrl
  })
}

/**
 * Menggambar image ke canvas dengan perilaku seperti CSS `object-fit: cover`
 * supaya foto tidak gepeng/stretch saat rasio berbeda dengan output.
 */
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

/**
 * Mengambil snapshot mentah dari elemen <video> yang sedang aktif,
 * lalu mengembalikannya sebagai dataURL. Otomatis mem-flip horizontal
 * kalau video sedang di-mirror (mode selfie), supaya hasil foto tidak
 * terbalik seperti cermin.
 */
export function captureVideoFrame(videoEl, mirrored = true) {
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight
  const ctx = canvas.getContext('2d')

  if (mirrored) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}
