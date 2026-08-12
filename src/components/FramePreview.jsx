import { useEffect, useState } from 'react'
import { renderFrameComposite } from '../utils/frameRenderer'

/**
 * Menampilkan pratinjau kecil sebuah frame di galeri pemilihan.
 *
 * - Frame bergambar (frame.thumbnail ada) -> langsung pakai file
 *   thumbnail ringan yang sudah disiapkan (JPG kecil), TIDAK memuat
 *   gambar overlay resolusi penuh di sini (biar galeri tetap ringan).
 * - Frame procedural (tanpa thumbnail) -> tetap dirender lewat Canvas
 *   seperti sebelumnya.
 */
export default function FramePreview({ frame }) {
  const [previewUrl, setPreviewUrl] = useState(frame.thumbnail || null)

  useEffect(() => {
    if (frame.thumbnail) {
      setPreviewUrl(frame.thumbnail)
      return
    }
    let mounted = true
    renderFrameComposite(frame, []).then((url) => {
      if (mounted) setPreviewUrl(url)
    })
    return () => {
      mounted = false
    }
  }, [frame])

  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-gray-100"
      style={{ aspectRatio: `${frame.canvas.width} / ${frame.canvas.height}` }}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={frame.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full animate-pulse bg-gray-200" />
      )}
    </div>
  )
}
