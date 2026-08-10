/**
 * Mengambil snapshot mentah dari elemen <video> yang sedang aktif,
 * lalu mengembalikannya sebagai dataURL. Otomatis mem-flip horizontal
 * kalau video sedang di-mirror (mode selfie), supaya hasil foto tidak
 * terbalik seperti cermin (sama seperti kamera HP pada umumnya).
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
