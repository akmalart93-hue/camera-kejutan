import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { useCamera } from '../../hooks/useCamera'
import { captureVideoFrame } from '../../utils/camera'
import { CAMERA_FILTERS, DEFAULT_FILTER_ID } from '../../data/cameraFilters'

const TIMER_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 3, label: '3s' },
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
]

export default function Capture() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { selectedFrame, setCapturedPhotos } = useContext(PhotoContext)
  const { videoRef, cameraState, facingMode, switching, startCamera, stopCamera, switchCamera } = useCamera()

  const [shots, setShots] = useState([])
  const [pendingShot, setPendingShot] = useState(null)
  const [flash, setFlash] = useState(false)
  const [filterId, setFilterId] = useState(DEFAULT_FILTER_ID)
  const [timerSeconds, setTimerSeconds] = useState(0) // 0 = timer mati
  const [countdown, setCountdown] = useState(null) // null = tidak sedang hitung mundur
  const doCaptureRef = useRef(null)

  const activeFilter = CAMERA_FILTERS.find((f) => f.id === filterId) || CAMERA_FILTERS[0]

  // Kalau belum ada frame terpilih (misal user refresh di halaman ini),
  // balikkan ke galeri pilih frame dulu.
  useEffect(() => {
    if (!selectedFrame) {
      navigate(`/ucapan/${slug}/frame`, { replace: true })
    }
  }, [selectedFrame, slug, navigate])

  const doCapture = () => {
    if (!videoRef.current) return
    setFlash(true)
    setTimeout(() => setFlash(false), 300)
    // Filter yang lagi dipilih ikut "dibakar" ke foto hasil, bukan cuma
    // tampilan preview — jadi hasil download nanti konsisten sama yg dilihat.
    // Mirror hanya untuk kamera depan (selfie); kamera belakang tidak di-mirror.
    const dataUrl = captureVideoFrame(videoRef.current, facingMode === 'user', activeFilter.css)
    setPendingShot(dataUrl)
  }
  // Simpan versi terbaru doCapture di ref, biar dipanggil dari dalam
  // useEffect hitung mundur tanpa masalah stale-closure
  doCaptureRef.current = doCapture

  // ---- Logika hitung mundur timer ----
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      setCountdown(null)
      doCaptureRef.current?.()
      return
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  if (!selectedFrame) return null

  const totalShots = selectedFrame.shotCount
  const currentNumber = Math.min(shots.length + 1, totalShots)
  const isCountingDown = countdown !== null

  const handleShutterClick = () => {
    if (timerSeconds === 0) {
      doCapture()
    } else {
      setCountdown(timerSeconds)
    }
  }

  const cancelCountdown = () => setCountdown(null)

  const confirmShot = () => {
    const next = [...shots, pendingShot]
    setShots(next)
    setPendingShot(null)

    if (next.length >= totalShots) {
      stopCamera()
      setCapturedPhotos(next)
      navigate(`/ucapan/${slug}/hasil`)
    }
  }

  const retakeShot = () => setPendingShot(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-white flex flex-col items-center px-4 py-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">{selectedFrame.name}</p>
        <h1 className="text-xl font-bold text-gray-800">
          Foto {currentNumber} dari {totalShots}
        </h1>
      </div>

      {/* Indikator progres */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: totalShots }).map((_, i) => (
          <span
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < shots.length ? 'bg-pink-500' : 'bg-pink-200'
            }`}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-xl bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ filter: !pendingShot ? activeFilter.css : 'none' }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            facingMode === 'user' ? 'mirror' : ''
          } ${cameraState === 'active' && !pendingShot ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Tombol ganti kamera depan/belakang */}
        {cameraState === 'active' && !pendingShot && !isCountingDown && (
          <button
            onClick={switchCamera}
            disabled={switching}
            aria-label="Ganti kamera"
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition disabled:opacity-50 z-10"
          >
            {switching ? (
              <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 12v-2a4 4 0 0 1 4-4h14" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 22l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v2a4 4 0 0 1-4 4H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {/* Overlay angka hitung mundur */}
        {isCountingDown && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <span
              key={countdown}
              className="text-white font-bold drop-shadow-lg"
              style={{ fontSize: '5.5rem', animation: 'countdown-pop 1s ease-out' }}
            >
              {countdown}
            </span>
          </div>
        )}

        {pendingShot && (
          <img
            src={pendingShot}
            alt="Pratinjau hasil jepretan"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {flash && (
          <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
        )}

        {cameraState !== 'active' && !pendingShot && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
            {cameraState === 'idle' && (
              <>
                <span className="text-4xl">📸</span>
                <p className="text-white/80 text-sm">Izinkan akses kamera untuk mulai</p>
                <button
                  onClick={startCamera}
                  className="bg-white text-gray-800 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-gray-100 transition"
                >
                  Buka Kamera
                </button>
              </>
            )}
            {cameraState === 'requesting' && (
              <p className="text-white/80 text-sm">Meminta izin kamera…</p>
            )}
            {cameraState === 'denied' && (
              <>
                <span className="text-4xl">🚫</span>
                <p className="text-white/80 text-sm">
                  Akses kamera ditolak. Aktifkan lewat pengaturan browser, lalu coba lagi.
                </p>
                <button
                  onClick={startCamera}
                  className="bg-white text-gray-800 font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-gray-100 transition"
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pemilih timer — hanya tampil saat kamera aktif & belum ada pending shot */}
      {cameraState === 'active' && !pendingShot && !isCountingDown && (
        <div className="w-full max-w-sm mt-4">
          <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">⏱ Timer</p>
          <div className="flex gap-2">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTimerSeconds(t.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                  timerSeconds === t.value
                    ? 'bg-pink-500 text-white shadow'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pemilih filter — hanya tampil saat kamera aktif & belum ada pending shot */}
      {cameraState === 'active' && !pendingShot && !isCountingDown && (
        <div className="w-full max-w-sm mt-3">
          <div className="flex gap-2 overflow-x-auto pb-1 px-1 -mx-1">
            {CAMERA_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterId(f.id)}
                className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-xs font-medium transition ${
                  filterId === f.id
                    ? 'bg-pink-500 text-white shadow'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <span className="text-lg leading-none">{f.emoji}</span>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Thumbnail foto yang sudah dikonfirmasi */}
      {shots.length > 0 && (
        <div className="flex gap-2 mt-4">
          {shots.map((s, i) => (
            <img
              key={i}
              src={s}
              alt={`Foto ${i + 1}`}
              className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow"
            />
          ))}
        </div>
      )}

      <div className="mt-6 w-full max-w-sm">
        {!pendingShot && !isCountingDown && cameraState === 'active' && (
          <div className="flex justify-center">
            <button
              onClick={handleShutterClick}
              className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 active:scale-95 transition shadow-lg ring-4 ring-pink-200 flex items-center justify-center"
              aria-label="Ambil foto"
            >
              <span className="w-11 h-11 rounded-full bg-white" />
            </button>
          </div>
        )}

        {isCountingDown && (
          <div className="flex justify-center">
            <button
              onClick={cancelCountdown}
              className="text-sm font-medium text-gray-500 underline underline-offset-4"
            >
              Batal
            </button>
          </div>
        )}

        {pendingShot && (
          <div className="flex gap-3">
            <button
              onClick={retakeShot}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-full hover:bg-gray-50 transition"
            >
              🔄 Ambil Ulang
            </button>
            <button
              onClick={confirmShot}
              className="flex-1 bg-pink-500 text-white font-semibold py-3 rounded-full hover:bg-pink-600 transition"
            >
              ✅ Pakai Foto Ini
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes countdown-pop {
          0% { transform: scale(1.7); opacity: 0; }
          25% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
