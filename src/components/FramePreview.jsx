import { useEffect, useState } from 'react'
import { renderFrameComposite } from '../utils/frameRenderer'

/**
 * Menampilkan pratinjau kecil sebuah frame (tanpa foto asli — slot
 * diisi placeholder transparan) untuk ditampilkan di galeri pemilihan.
 */
export default function FramePreview({ frame }) {
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
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
        <img src={previewUrl} alt={frame.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full animate-pulse bg-gray-200" />
      )}
    </div>
  )
}
