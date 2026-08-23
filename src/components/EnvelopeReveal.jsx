import { useState } from 'react'

/**
 * Amplop yang bisa "dibuka" dengan tap — flap-nya membuka pakai animasi
 * rotate 3D, ada beberapa hati yang "kabur" keluar, lalu suratnya (children)
 * muncul. Pola ini terinspirasi dari envelope-opening card yang umum
 * dipakai di web ucapan interaktif.
 */
export default function EnvelopeReveal({ onRevealed, children }) {
  const [opened, setOpened] = useState(false)
  const [showLetter, setShowLetter] = useState(false)

  const handleOpen = () => {
    if (opened) return
    setOpened(true)
    setTimeout(() => setShowLetter(true), 650)
    setTimeout(() => onRevealed?.(), 750)
  }

  return (
    <div className="w-full flex flex-col items-center py-4">
      {!showLetter && (
        <button
          onClick={handleOpen}
          aria-label="Buka amplop"
          className="relative w-64 h-44 active:scale-[0.98] transition-transform"
          style={{ perspective: '1000px' }}
        >
          {/* Badan amplop */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-200 to-purple-200 shadow-xl overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: '65%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0))',
              }}
            />
          </div>

          {/* Flap segitiga atas — membuka dengan rotateX */}
          <div
            className="absolute top-0 left-0 w-full transition-transform duration-700 ease-out"
            style={{
              height: '52%',
              background: 'linear-gradient(135deg, #f9a8d4, #c4b5fd)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              transform: opened ? 'rotateX(150deg)' : 'rotateX(0deg)',
            }}
          />

          {/* Hati-hati yang kabur saat dibuka */}
          {opened &&
            Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-pink-400 text-lg"
                style={{
                  left: `${15 + i * 12}%`,
                  bottom: '48%',
                  animation: 'envelope-heart-float 1s ease-out forwards',
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                💗
              </span>
            ))}

          {!opened && (
            <p className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white drop-shadow">
              Ketuk untuk buka ✉️
            </p>
          )}
        </button>
      )}

      {showLetter && <div className="w-full animate-pop-in">{children}</div>}

      <style>{`
        @keyframes envelope-heart-float {
          0% { transform: translateY(0) scale(0.6); opacity: 1; }
          100% { transform: translateY(-70px) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
