import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { renderFrameComposite } from '../../utils/frameRenderer'
import {
  buildCustomFrame,
  ASPECT_PRESETS,
  LAYOUTS,
  BG_COLOR_PRESETS,
  FRAME_THEMES,
} from '../../utils/customFrameBuilder'

const EMOJI_PALETTE = [
  '🎉', '🎊', '✨', '💕', '💖', '🎂', '🎈', '🌸',
  '⭐', '🌈', '🦋', '🍾', '👑', '🔥', '💐', '🎓',
]

const TEXT_COLOR_PRESETS = ['#ec4899', '#a855f7', '#0369a1', '#15803d', '#f59e0b', '#000000', '#ffffff']

let decorationIdCounter = 0
const nextDecorationId = () => {
  decorationIdCounter += 1
  return `decor-${Date.now()}-${decorationIdCounter}`
}

export default function CustomFrameBuilder() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setSelectedFrame } = useContext(PhotoContext)

  const [shotCount, setShotCount] = useState(3)
  const [layout, setLayout] = useState('strip')
  const [aspect, setAspect] = useState('portrait')
  const [themeId, setThemeId] = useState(FRAME_THEMES[0].id)
  const [customBgColor, setCustomBgColor] = useState(BG_COLOR_PRESETS[0])
  const [rounded, setRounded] = useState(true)
  const [caption, setCaption] = useState('')

  const activeTheme = FRAME_THEMES.find((t) => t.id === themeId) || FRAME_THEMES[0]
  // Tema "Warna Sendiri" pakai warna pilihan bebas, tema lain pakai
  // kombinasi warna yang sudah didesain (gradient/solid) dari tema itu.
  const background =
    activeTheme.id === 'sendiri'
      ? { type: 'solid', color: customBgColor }
      : activeTheme.background

  const [decorations, setDecorations] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  const [previewUrl, setPreviewUrl] = useState(null)
  const previewRef = useRef(null)
  const draggingIdRef = useRef(null)

  // Frame dasar (TANPA dekorasi) — dipakai buat gambar latar preview saja.
  // Dekorasi digambar terpisah sebagai elemen HTML di atasnya biar drag-nya
  // ringan (nggak perlu render ulang Canvas tiap gerak sedikit).
  const baseFrame = buildCustomFrame({ shotCount, layout, aspect, background, rounded, caption })

  useEffect(() => {
    let mounted = true
    renderFrameComposite(baseFrame, []).then((url) => {
      if (mounted) setPreviewUrl(url)
    })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotCount, layout, aspect, themeId, customBgColor, rounded, caption])

  const selectedDecoration = decorations.find((d) => d.id === selectedId) || null

  const addEmoji = (emoji) => {
    const id = nextDecorationId()
    setDecorations((d) => [...d, { id, type: 'emoji', content: emoji, xPct: 50, yPct: 50, size: 46, rotation: 0 }])
    setSelectedId(id)
  }

  const addText = () => {
    const id = nextDecorationId()
    setDecorations((d) => [
      ...d,
      { id, type: 'text', content: 'Teks', xPct: 50, yPct: 50, size: 32, rotation: 0, color: '#ec4899' },
    ])
    setSelectedId(id)
  }

  const updateDecoration = (id, patch) => {
    setDecorations((d) => d.map((dec) => (dec.id === id ? { ...dec, ...patch } : dec)))
  }

  const removeDecoration = (id) => {
    setDecorations((d) => d.filter((dec) => dec.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // ---- Drag handling (pointer events, jalan buat mouse & touch) ----
  const handlePointerDown = (e, id) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedId(id)
    draggingIdRef.current = id
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e) => {
    const id = draggingIdRef.current
    if (!id || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const xPct = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100))
    const yPct = Math.min(96, Math.max(4, ((e.clientY - rect.top) / rect.height) * 100))
    updateDecoration(id, { xPct, yPct })
  }

  const handlePointerUp = () => {
    draggingIdRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUse = () => {
    const finalFrame = buildCustomFrame({
      shotCount, layout, aspect, background, rounded, caption, decorations,
    })
    setSelectedFrame(finalFrame)
    navigate(`/ucapan/${slug}/foto`)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 pb-28">
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-gray-800">Buat Frame Sendiri 🎨</h1>
        <p className="text-gray-500 text-sm mt-1">Atur bebas & hias sesukamu</p>
      </div>

      <div className="max-w-md mx-auto space-y-5">
        {/* ---- Live preview + overlay dekorasi draggable ---- */}
        <div>
          <div
            ref={previewRef}
            onClick={() => setSelectedId(null)}
            className="relative mx-auto rounded-2xl overflow-hidden shadow-lg bg-white touch-none select-none"
            style={{
              aspectRatio: `${baseFrame.canvas.width} / ${baseFrame.canvas.height}`,
              maxWidth: 240,
            }}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview frame" className="w-full h-full object-cover pointer-events-none" draggable={false} />
            ) : (
              <div className="w-full h-full animate-pulse bg-gray-200" />
            )}

            {decorations.map((d) => (
              <div
                key={d.id}
                onPointerDown={(e) => handlePointerDown(e, d.id)}
                className={`absolute cursor-grab active:cursor-grabbing leading-none ${
                  selectedId === d.id ? 'outline outline-2 outline-pink-400 outline-offset-4 rounded' : ''
                }`}
                style={{
                  left: `${d.xPct}%`,
                  top: `${d.yPct}%`,
                  transform: `translate(-50%, -50%) rotate(${d.rotation}deg)`,
                  fontSize: d.size * 0.42, // diskalakan turun dari ukuran kanvas asli ke ukuran preview
                  color: d.type === 'text' ? d.color : undefined,
                  fontWeight: d.type === 'text' ? 700 : 400,
                  fontFamily: d.type === 'text' ? 'Poppins, sans-serif' : undefined,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.content}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Tap stiker/teks buat pilih & atur, seret buat pindah posisi
          </p>
        </div>

        {/* ---- Pilih tema (background + palet stiker serasi) ---- */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
          <div className="grid grid-cols-3 gap-2">
            {FRAME_THEMES.map((t) => {
              const previewBg =
                t.background.type === 'gradient'
                  ? `linear-gradient(135deg, ${t.background.from}, ${t.background.to})`
                  : t.background.color
              return (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  className={`rounded-xl border-2 overflow-hidden text-center transition ${
                    themeId === t.id ? 'border-pink-500 scale-[1.03]' : 'border-gray-200'
                  }`}
                >
                  <div className="h-10 w-full" style={{ background: previewBg }} />
                  <div className="py-1.5 bg-white">
                    <span className="text-xs font-medium text-gray-700">{t.emoji} {t.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ---- Kontrol untuk dekorasi yang lagi dipilih ---- */}
        {selectedDecoration && (
          <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-pink-700">
                Atur {selectedDecoration.type === 'text' ? 'Teks' : 'Stiker'}
              </p>
              <button
                onClick={() => removeDecoration(selectedDecoration.id)}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                🗑 Hapus
              </button>
            </div>

            {selectedDecoration.type === 'text' && (
              <input
                type="text"
                value={selectedDecoration.content}
                onChange={(e) => updateDecoration(selectedDecoration.id, { content: e.target.value.slice(0, 24) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                placeholder="Tulis sesuatu..."
              />
            )}

            <div>
              <label className="text-xs text-gray-500">Ukuran</label>
              <input
                type="range"
                min="20"
                max="100"
                value={selectedDecoration.size}
                onChange={(e) => updateDecoration(selectedDecoration.id, { size: Number(e.target.value) })}
                className="w-full accent-pink-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Rotasi</label>
              <input
                type="range"
                min="-45"
                max="45"
                value={selectedDecoration.rotation}
                onChange={(e) => updateDecoration(selectedDecoration.id, { rotation: Number(e.target.value) })}
                className="w-full accent-pink-500"
              />
            </div>

            {selectedDecoration.type === 'text' && (
              <div className="flex flex-wrap gap-1.5">
                {TEXT_COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateDecoration(selectedDecoration.id, { color: c })}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedDecoration.color === c ? 'border-gray-700 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- Palet tambah dekorasi ---- */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hiasan <span className="text-gray-400 font-normal">(opsional, sesuai tema {activeTheme.label})</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {activeTheme.stickers.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="w-9 h-9 flex items-center justify-center text-lg rounded-lg bg-gray-50 hover:bg-pink-50 border border-gray-200 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
          <details className="mb-3">
            <summary className="text-xs text-gray-400 cursor-pointer select-none">Lihat semua emoji lainnya</summary>
            <div className="flex flex-wrap gap-2 mt-2">
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-lg rounded-lg bg-gray-50 hover:bg-pink-50 border border-gray-200 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </details>
          <button
            onClick={addText}
            className="text-sm font-medium px-3 py-2 rounded-lg bg-gray-50 hover:bg-pink-50 border border-gray-200 text-gray-600 transition"
          >
            + Tambah Teks
          </button>
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

        {/* Warna latar — cuma tampil kalau tema "Warna Sendiri" dipilih,
            tema lain sudah punya kombinasi warna sendiri yang serasi */}
        {activeTheme.id === 'sendiri' && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Warna Latar</label>
            <div className="flex flex-wrap gap-2 items-center">
              {BG_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCustomBgColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    customBgColor === c ? 'border-pink-500 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Warna ${c}`}
                />
              ))}
              <input
                type="color"
                value={customBgColor}
                onChange={(e) => setCustomBgColor(e.target.value)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
                title="Warna custom"
              />
            </div>
          </div>
        )}

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
