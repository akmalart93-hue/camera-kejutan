import { useMemo, useState } from 'react'
import confetti from 'canvas-confetti'

const BALLOON_COLORS = ['#f472b6', '#a78bfa', '#60a5fa', '#facc15', '#fb923c', '#34d399']

/**
 * Cara buka pesan alternatif: sekumpulan balon mengambang, pengunjung
 * tap satu-satu untuk memecahkannya. Setelah SEMUA balon pecah, pesan
 * di baliknya (children) baru terlihat.
 */
export default function TapBalloons({ children, onRevealed, count = 6 }) {
  const [popped, setPopped] = useState(() => new Set())
  const [revealed, setRevealed] = useState(false)

  const balloons = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      left: 8 + ((i * 137) % 84), // sebaran posisi horizontal semi-acak tapi konsisten
      delay: (i % 4) * 0.4,
      duration: 2.6 + (i % 3) * 0.5,
    }))
  }, [count])

  const handlePop = (id, e) => {
    if (popped.has(id) || revealed) return

    const rect = e.currentTarget.getBoundingClientRect()
    confetti({
      particleCount: 26,
      spread: 60,
      startVelocity: 22,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: BALLOON_COLORS,
      scalar: 0.7,
    })

    const next = new Set(popped)
    next.add(id)
    setPopped(next)

    if (next.size >= count) {
      setTimeout(() => {
        setRevealed(true)
        onRevealed?.()
      }, 300)
    }
  }

  return (
    <div className="relative w-full min-h-[19rem] rounded-2xl overflow-hidden shadow-lg bg-gradient-to-b from-sky-50 to-white">
      <div className={`transition-opacity duration-700 ${revealed ? 'opacity-100' : 'opacity-0'}`}>
        {children}
      </div>

      {!revealed && (
        <div className="absolute inset-0">
          {balloons.map((b) => {
            const isPopped = popped.has(b.id)
            return (
              <button
                key={b.id}
                onClick={(e) => handlePop(b.id, e)}
                disabled={isPopped}
                aria-label="Pecahkan balon"
                className="absolute bottom-0 -translate-x-1/2 transition-transform duration-200 active:scale-90"
                style={{
                  left: `${b.left}%`,
                  animation: isPopped
                    ? 'none'
                    : `float-balloon ${b.duration}s ease-in-out ${b.delay}s infinite`,
                  opacity: isPopped ? 0 : 1,
                  transform: isPopped ? 'scale(0)' : undefined,
                  pointerEvents: isPopped ? 'none' : 'auto',
                }}
              >
                <svg width="52" height="66" viewBox="0 0 52 66" fill="none">
                  <ellipse cx="26" cy="26" rx="24" ry="26" fill={b.color} />
                  <path d="M26 52 L26 62" stroke="#999" strokeWidth="1.5" />
                  <path d="M20 58 L26 62 L32 58" stroke="#999" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
            )
          })}
        </div>
      )}

      {!revealed && (
        <p className="absolute top-3 left-0 right-0 text-center text-xs text-gray-500 px-4">
          Tap semua balon untuk membuka pesannya 🎈 ({popped.size}/{count})
        </p>
      )}

      <style>{`
        @keyframes float-balloon {
          0%, 100% { bottom: 0.5rem; }
          50% { bottom: 3rem; }
        }
      `}</style>
    </div>
  )
}
