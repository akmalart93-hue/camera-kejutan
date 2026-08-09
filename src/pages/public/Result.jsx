import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { mergePhotoWithFrame } from '../../utils/mergePhotoWithFrame'

const FRAME_URL = `${import.meta.env.BASE_URL}frames/frame1.svg`

export default function Result() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { capturedPhoto } = useContext(PhotoContext)

  const [mergedImage, setMergedImage] = useState(null)
  const [processing, setProcessing] = useState(true)
  const [mergeError, setMergeError] = useState(false)

  useEffect(() => {
    // Kalau user refresh halaman ini langsung / tidak ada foto,
    // foto yang tersimpan di context akan hilang -> balikkan ke kamera.
    if (!capturedPhoto) {
      navigate(`/ucapan/${slug}`, { replace: true })
      return
    }

    mergePhotoWithFrame(capturedPhoto, FRAME_URL)
      .then((result) => {
        setMergedImage(result)
        setProcessing(false)
      })
      .catch((err) => {
        console.error(err)
        setMergeError(true)
        setProcessing(false)
      })
  }, [capturedPhoto, slug, navigate])

  const handleDownload = () => {
    if (!mergedImage) return
    const link = document.createElement('a')
    link.href = mergedImage
    link.download = `photobox-${slug}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-pink-50 to-white flex flex-col items-center px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ini hasil photobox-mu! 📷</h1>
        <p className="text-gray-500 text-sm mt-1">Simpan sebagai kenang-kenangan</p>
      </div>

      <div className="w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-xl bg-gray-100 flex items-center justify-center">
        {processing && (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-pink-400" />
            <p className="text-sm">Menggabungkan foto…</p>
          </div>
        )}

        {mergeError && (
          <p className="text-red-500 text-sm px-6 text-center">
            Gagal memproses foto. Silakan ulangi dari awal.
          </p>
        )}

        {mergedImage && !processing && (
          <img src={mergedImage} alt="Hasil photobox" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="w-full max-w-sm mt-6 space-y-3">
        <button
          onClick={handleDownload}
          disabled={!mergedImage}
          className="w-full bg-white border-2 border-pink-400 text-pink-500 font-semibold py-3 rounded-full hover:bg-pink-50 transition disabled:opacity-50"
        >
          ⬇️ Download Foto Ini
        </button>

        <button
          onClick={() => navigate(`/ucapan/${slug}/wishes`)}
          disabled={!mergedImage}
          className="w-full bg-pink-500 text-white font-semibold py-3 rounded-full hover:bg-pink-600 transition disabled:opacity-50"
        >
          Lanjut ke Kejutan 🎁
        </button>

        {mergeError && (
          <Link
            to={`/ucapan/${slug}`}
            className="block text-center text-sm text-gray-400 underline mt-2"
          >
            Ulangi dari kamera
          </Link>
        )}
      </div>
    </div>
  )
}
