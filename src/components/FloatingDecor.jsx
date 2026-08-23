import { useMemo } from 'react'

const ITEMS = ['🎉', '✨', '💫', '🎈', '⭐']

/**
 * Dekorasi ambient di latar belakang halaman ucapan — emoji melayang
 * pelan ke atas terus-menerus, biar halamannya terasa "hidup" bukan statis.
 * pointer-events-none supaya tidak menghalangi interaksi user sama sekali.
 */
export default function FloatingDecor({ count = 10 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: ITEMS[i % ITEMS.length],
        left: Math.random() * 100,
        duration: 8 + Math.random() * 6,
        delay: Math.random() * 6,
        size: 14 + Math.random() * 14,
      })),
    [count]
  )

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute opacity-60"
          style={{
            left: `${p.left}%`,
            bottom: '-40px',
            fontSize: p.size,
            animation: `drift-up ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <style>{`
        @keyframes drift-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
