import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { FRAMES } from '../../data/frames'
import FramePreview from '../../components/FramePreview'

export default function FrameGallery() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setSelectedFrame } = useContext(PhotoContext)

  const handlePick = (frame) => {
    setSelectedFrame(frame)
    navigate(`/ucapan/${slug}/foto`)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Pilih Frame Photobox-mu ✨</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tiap frame punya jumlah & gaya foto yang berbeda
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
        {FRAMES.map((frame) => (
          <button
            key={frame.id}
            onClick={() => handlePick(frame)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition p-2 text-left"
          >
            <FramePreview frame={frame} />
            <p className="text-sm font-semibold text-gray-800 mt-2 px-1">{frame.name}</p>
            <p className="text-xs text-gray-400 px-1 pb-1">{frame.shotCount} foto</p>
          </button>
        ))}
      </div>
    </div>
  )
}
