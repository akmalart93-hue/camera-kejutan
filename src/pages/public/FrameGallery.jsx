import { useContext, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { FRAME_CATEGORIES, FRAMES } from '../../data/frames'
import FramePreview from '../../components/FramePreview'

export default function FrameGallery() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setSelectedFrame } = useContext(PhotoContext)
  const [activeCategory, setActiveCategory] = useState(FRAME_CATEGORIES[0].id)

  const filteredFrames = useMemo(
    () => FRAMES.filter((f) => f.category === activeCategory),
    [activeCategory]
  )

  const handlePick = (frame) => {
    setSelectedFrame(frame)
    navigate(`/ucapan/${slug}/foto`)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-gray-800">Pilih Frame Photobox-mu ✨</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tiap frame punya jumlah & gaya foto yang berbeda
        </p>
      </div>

      {/* Tabs kategori */}
      <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-1">
        {FRAME_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === cat.id
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
        {filteredFrames.map((frame) => (
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
