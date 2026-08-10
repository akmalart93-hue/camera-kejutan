import { useState } from 'react'
import { useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useBirthdayLink } from '../../hooks/useBirthdayLink'
import ScratchCard from '../../components/ScratchCard'

export default function Wishes() {
  const { slug } = useParams()
  const { data: birthday, loading, error } = useBirthdayLink(slug)
  const [revealed, setRevealed] = useState(false)

  const fireConfetti = () => {
    const colors = ['#f472b6', '#a78bfa', '#facc15', '#60a5fa']
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors })
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0 }, colors })
      confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1 }, colors })
    }, 300)
  }

  const handleRevealed = () => {
    if (revealed) return
    setRevealed(true)
    fireConfetti()
  }

  if (loading) return <CenteredMessage emoji="⏳" text="Memuat…" />
  if (error || !birthday) return <CenteredMessage emoji="😕" text="Ucapan tidak ditemukan." />

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-pink-50 to-purple-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full text-center">
        <span className="text-6xl block mb-3">🎂🎉</span>
        <h1 className="text-2xl font-bold text-gray-800">Selamat Ulang Tahun,</h1>
        <h2 className="text-2xl font-bold text-pink-500 mb-5">{birthday.name}!</h2>

        {!revealed && (
          <p className="text-sm text-gray-500 mb-3">
            Gosok kartu di bawah untuk membuka pesannya ✨
          </p>
        )}

        <ScratchCard onRevealed={handleRevealed}>
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 sm:p-8 h-full flex items-center">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-left">
              {birthday.message}
            </p>
          </div>
        </ScratchCard>

        {revealed && (
          <button
            onClick={fireConfetti}
            className="mt-6 text-sm font-medium text-purple-500 underline underline-offset-4"
          >
            Tabur confetti lagi 🎊
          </button>
        )}
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
