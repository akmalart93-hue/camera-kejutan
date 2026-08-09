import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useBirthdayLink } from '../../hooks/useBirthdayLink'

export default function Wishes() {
  const { slug } = useParams()
  const { data: birthday, loading, error } = useBirthdayLink(slug)

  useEffect(() => {
    if (!birthday) return
    fireConfetti()
  }, [birthday])

  const fireConfetti = () => {
    const colors = ['#f472b6', '#a78bfa', '#facc15', '#60a5fa']

    // Tembakan pertama dari tengah
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors,
    })

    // Susulan dari kiri & kanan sedikit delay biar terasa "meriah"
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0 }, colors })
      confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1 }, colors })
    }, 300)
  }

  if (loading) {
    return <CenteredMessage emoji="⏳" text="Memuat…" />
  }

  if (error || !birthday) {
    return <CenteredMessage emoji="😕" text="Ucapan tidak ditemukan." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-pink-50 to-purple-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full text-center animate-pop-in">
        <span className="text-6xl block mb-4">🎂🎉</span>
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          Selamat Ulang Tahun,
        </h1>
        <h2 className="text-3xl font-bold text-pink-500 mb-6">{birthday.name}!</h2>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 sm:p-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {birthday.message}
          </p>
        </div>

        <button
          onClick={fireConfetti}
          className="mt-8 text-sm font-medium text-purple-500 underline underline-offset-4"
        >
          Tabur confetti lagi 🎊
        </button>
      </div>
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
