import { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { PhotoContext } from '../../App'
import { useBirthdayLink } from '../../hooks/useBirthdayLink'
import { getFontFamily } from '../../data/fontOptions'
import { getBgTheme } from '../../data/bgThemes'
import ScratchCard from '../../components/ScratchCard'
import TapBalloons from '../../components/TapBalloons'
import EnvelopeReveal from '../../components/EnvelopeReveal'
import TypewriterText from '../../components/TypewriterText'
import FloatingDecor from '../../components/FloatingDecor'
import BackgroundMusic from '../../components/BackgroundMusic'

const HINTS = {
  'tap-balloons': 'Pecahkan semua balon untuk membuka pesannya 🎈',
  scratch: 'Gosok kartu di bawah untuk membuka pesannya ✨',
  envelope: 'Ketuk amplop untuk membuka pesannya 💌',
}

export default function Wishes() {
  const { slug } = useParams()
  const { data: birthday, loading, error } = useBirthdayLink(slug)
  const { finalPhoto } = useContext(PhotoContext)
  const [revealed, setRevealed] = useState(false)
  const musicRef = useRef(null)

  const revealStyle = birthday?.reveal_style || 'scratch'

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
    // Momen "buka pesan" ini termasuk gestur/interaksi user, jadi browser
    // biasanya izinkan audio ikut mulai di titik ini (beda dengan autoplay
    // murni tanpa interaksi sama sekali, yang selalu diblokir browser).
    musicRef.current?.play()
  }

  // Gaya "simple" langsung terbuka + confetti otomatis begitu halaman siap
  useEffect(() => {
    if (revealStyle === 'simple' && birthday && !revealed) {
      handleRevealed()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealStyle, birthday])

  if (loading) return <CenteredMessage emoji="⏳" text="Memuat…" />
  if (error || !birthday) return <CenteredMessage emoji="😕" text="Ucapan tidak ditemukan." />

  const messageStyle = {
    fontFamily: getFontFamily(birthday.font_family),
    color: birthday.text_color || '#374151',
  }
  const theme = getBgTheme(birthday.bg_theme)

  // Pesan diketik huruf-demi-huruf begitu terbuka — sebelum terbuka,
  // teksnya tersembunyi (kosong) di balik kartu interaksi.
  const MessageCard = (
    <div className="bg-white/90 backdrop-blur rounded-2xl p-6 sm:p-8 h-full flex items-center">
      {revealed ? (
        <TypewriterText
          text={birthday.message}
          className="leading-relaxed whitespace-pre-line text-left"
          style={messageStyle}
        />
      ) : (
        <p className="leading-relaxed whitespace-pre-line text-left invisible" style={messageStyle}>
          {birthday.message}
        </p>
      )}
    </div>
  )

  return (
    <div className={`relative min-h-screen ${theme.pageClass} flex items-center justify-center px-4 py-10 overflow-hidden`}>
      <FloatingDecor />
      <BackgroundMusic ref={musicRef} url={birthday.music_url} />

      <div className="relative z-10 max-w-md w-full text-center">
        <span className="text-6xl block mb-3">{birthday.greeting_emoji || '🎉'}</span>
        <h1 className="text-2xl font-bold" style={{ color: theme.headingColor }}>
          {birthday.greeting_title || 'Selamat untuk'},
        </h1>
        <h2 className="text-2xl font-bold mb-5" style={{ color: birthday.accent_color || '#ec4899' }}>
          {birthday.name}!
        </h2>

        {/* Foto hasil photobox (dari langkah photobox sebelumnya) — ditampilkan
            apa adanya, karena bingkainya sendiri sudah didesain di langkah
            pemilihan frame, jadi tidak perlu dibungkus gaya lain lagi */}
        {finalPhoto && (
          <div className="mb-6 rounded-2xl overflow-hidden shadow-lg border-4 border-white max-w-[220px] mx-auto animate-pop-in">
            <img src={finalPhoto} alt="Hasil photobox" className="w-full h-full object-cover" />
          </div>
        )}

        {!revealed && revealStyle !== 'simple' && (
          <p className="text-sm mb-3" style={{ color: theme.hintColor }}>{HINTS[revealStyle] || HINTS.scratch}</p>
        )}

        {revealStyle === 'tap-balloons' ? (
          <TapBalloons onRevealed={handleRevealed}>{MessageCard}</TapBalloons>
        ) : revealStyle === 'envelope' ? (
          <EnvelopeReveal onRevealed={handleRevealed}>{MessageCard}</EnvelopeReveal>
        ) : revealStyle === 'simple' ? (
          <div className={`transition-opacity duration-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
            {MessageCard}
          </div>
        ) : (
          <ScratchCard onRevealed={handleRevealed}>{MessageCard}</ScratchCard>
        )}

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
