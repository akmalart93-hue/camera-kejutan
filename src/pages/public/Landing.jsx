import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { useBirthdayLink } from '../../hooks/useBirthdayLink'
import { captureVideoFrame } from '../../utils/mergePhotoWithFrame'

const FRAME_URL = `${import.meta.env.BASE_URL}frames/frame1.svg`

export default function Landing() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { setCapturedPhoto } = useContext(PhotoContext)
  const { data: birthday, loading, error } = useBirthdayLink(slug)

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraState, setCameraState] = useState('idle') // idle | requesting | active | denied
  const [flash, setFlash] = useState(false)

  const startCamera = async () => {
    setCameraState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraState('active')
    } catch (err) {
      console.error(err)
      setCameraState('denied')
    }
  }

  // PENTING: elemen <video> baru benar-benar ada di DOM setelah cameraState
  // berubah jadi 'active' (render ulang). Kalau kita pasang srcObject di
  // dalam startCamera() (sebelum render ulang terjadi), videoRef.current
  // masih null/lama, jadi videonya kosong meski izin kamera sudah diberikan.
  // Solusinya: pasang srcObject di sini, setelah video element pasti ada.
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraState])

  // Matikan kamera saat pindah halaman (hemat baterai & privasi)
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleCapture = () => {
    if (!videoRef.current) return

    setFlash(true)
    setTimeout(() => setFlash(false), 400)

    const dataUrl = captureVideoFrame(videoRef.current, true)
    setCapturedPhoto(dataUrl)

    streamRef.current?.getTracks().forEach((track) => track.stop())

    setTimeout(() => {
      navigate(`/ucapan/${slug}/result`)
    }, 350)
  }

  if (loading) {
    return <CenteredMessage emoji="⏳" text="Memuat..." />
  }

  if (error || !birthday) {
    return (
      <CenteredMessage
        emoji="😕"
        text="Link ini tidak ditemukan. Cek kembali link yang kamu terima."
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-white flex flex-col items-center px-4 py-8">
      <div className="text-center mb-6 animate-pop-in">
        <p className="text-lg text-gray-500">Halo,</p>
        <h1 className="text-3xl font-bold text-gray-800">{birthday.name}! 🎉</h1>
        <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">
          Sebelum menerima kejutanmu, ambil satu foto dulu di photobox ini yuk!
        </p>
      </div>

      {/* Frame Kamera / Photobox */}
      <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-xl bg-gray-900">
        {/* Video selalu di-render (bukan disyaratkan cameraState === 'active')
            supaya videoRef.current sudah pasti ada saat effect di atas
            mencoba memasang stream-nya. Ditampilkan/disembunyikan pakai opacity. */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`mirror absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraState === 'active' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Overlay frame photobox lucu, selalu tampil di atas video */}
        <img
          src={FRAME_URL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
        />

        {/* Flash effect saat capture */}
        {flash && (
          <div className="absolute inset-0 bg-white animate-flash pointer-events-none" />
        )}

        {cameraState !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
            {cameraState === 'idle' && (
              <>
                <span className="text-4xl">📸</span>
                <p className="text-white/80 text-sm">
                  Izinkan akses kamera untuk mulai photobox
                </p>
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
                  Akses kamera ditolak. Aktifkan izin kamera di pengaturan
                  browser, lalu coba lagi.
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

      {cameraState === 'active' && (
        <button
          onClick={handleCapture}
          className="mt-8 w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 active:scale-95 transition shadow-lg ring-4 ring-pink-200 flex items-center justify-center"
          aria-label="Ambil foto"
        >
          <span className="w-11 h-11 rounded-full bg-white" />
        </button>
      )}
    </div>
  )
}

function CenteredMessage({ emoji, text }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gray-50">
      <span className="text-5xl mb-3">{emoji}</span>
      <p className="text-gray-600">{text}</p>
    </div>
  )
}
