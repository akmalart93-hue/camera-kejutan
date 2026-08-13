import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { renderFrameComposite } from '../../utils/frameRenderer'
import {
  buildCustomFrame,
  ASPECT_PRESETS,
  LAYOUTS,
  BG_COLOR_PRESETS,
} from '../../utils/customFrameBuilder'

export default function CustomFrameBuilder() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setSelectedFrame } = useContext(PhotoContext)

  const [shotCount, setShotCount] = useState(3)
  const [layout, setLayout] = useState('strip')
  const [aspect, setAspect] = useState('portrait')
  const [bgColor, setBgColor] = useState(BG_COLOR_PRESETS[0])
  const [rounded, setRounded] = useState(true)
  const [caption, setCaption] = useState('')

  const [previewUrl, setPreviewUrl] = useState(null)

  const currentFrame = buildCustomFrame({ shotCount, layout, aspect, bgColor, rounded, caption })

  // Live preview — dirender ulang tiap ada perubahan pengaturan
  useEffect(() => {
    let mounted = true
    renderFrameComposite(currentFrame, []).then((url) => {
      if (mounted) setPreviewUrl(url)
    })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotCount, layout, aspect, bgColor, rounded, caption])

  const handleUse = () => {
    setSelectedFrame(currentFrame)
    navigate(`/ucapan/${slug}/foto`)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-28">
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-gray-800">Buat Frame Sendiri 🎨</h1>
        <p className="text-gray-500 text-sm mt-1">Atur bebas, bukan cuma template</p>
      </div>

      <div className="max-w-md mx-auto space-y-5">
        {/* Live preview */}
        <div
          className="mx-auto rounded-2xl overflow-hidden shadow-lg bg-white"
          style={{
            aspectRatio: `${currentFrame.canvas.width} / ${currentFrame.canvas.height}`,
            maxWidth: 220,
          }}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview frame" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full animate-pulse bg-gray-200" />
          )}
        </div>

        {/* Jumlah foto */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jumlah Foto: <span className="text-pink-500 font-bold">{shotCount}</span>
          </label>
          <input
            type="range"
            min="1"
            max="8"
            value={shotCount}
            onChange={(e) => setShotCount(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>8</span>
          </div>
        </div>

        {/* Layout */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(LAYOUTS).map((l) => (
              <button
                key={l.id}
                onClick={() => setLayout(l.id)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                  layout === l.id
                    ? 'border-pink-500 bg-pink-50 text-pink-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rasio kanvas */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran / Rasio</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(ASPECT_PRESETS).map((p) => (
              <button
                key={p.id}
                onClick={() => setAspect(p.id)}
                className={`px-2 py-2.5 rounded-xl border-2 text-center transition ${
                  aspect === p.id
                    ? 'border-pink-500 bg-pink-50 text-pink-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-semibold">{p.label}</div>
                <div className="text-[10px] text-gray-400">{p.ratioLabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Warna latar */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Warna Latar</label>
          <div className="flex flex-wrap gap-2 items-center">
            {BG_COLOR_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setBgColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition ${
                  bgColor === c ? 'border-pink-500 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Warna ${c}`}
              />
            ))}
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
              title="Warna custom"
            />
          </div>
        </div>

        {/* Sudut & caption */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sudut Foto</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRounded(false)}
                className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition ${
                  !rounded ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-600'
                }`}
              >
                ◻ Kotak
              </button>
              <button
                onClick={() => setRounded(true)}
                className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition ${
                  rounded ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-600'
                }`}
              >
                ▢ Membulat
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teks Bawah <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 30))}
              placeholder="Contoh: catch the moment! / happy day!"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tombol pakai — fixed di bawah biar selalu kejangkau */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleUse}
          className="max-w-md mx-auto block w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3.5 rounded-full shadow-lg transition"
        >
          Pakai Frame Ini 📸
        </button>
      </div>
    </div>
  )
}
