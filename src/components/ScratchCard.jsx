import { useEffect, useRef, useState } from 'react'

const REVEAL_THRESHOLD = 0.5 // 50% tergosok = otomatis terbuka penuh

/**
 * Kartu gosok (scratch card) berbasis Canvas.
 * `children` adalah konten yang tersembunyi di baliknya (pesan ucapan).
 * Panggil `onRevealed` sekali saat area yang tergosok melewati ambang batas.
 */
export default function ScratchCard({ children, onRevealed }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const isScratching = useRef(false)
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 })
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setDimensions({ w: rect.width, h: rect.height })
  }, [])

  // Gambar lapisan "kartu gosok" (perak + tulisan petunjuk)
  useEffect(() => {
    if (!canvasRef.current || dimensions.w === 0) return
    const canvas = canvasRef.current
    canvas.width = dimensions.w
    canvas.height = dimensions.h
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, dimensions.w, dimensions.h)
    gradient.addColorStop(0, '#cbd5e1')
    gradient.addColorStop(0.5, '#e2e8f0')
    gradient.addColorStop(1, '#94a3b8')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, dimensions.w, dimensions.h)

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    for (let i = 0; i < 40; i++) {
      ctx.beginPath()
      ctx.arc(
        Math.random() * dimensions.w,
        Math.random() * dimensions.h,
        Math.random() * 2 + 0.5,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    ctx.fillStyle = '#475569'
    ctx.font = '600 16px Poppins, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('👆 gosok di sini', dimensions.w / 2, dimensions.h / 2)
  }, [dimensions])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }

  const scratchAt = (x, y) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 32, 0, Math.PI * 2)
    ctx.fill()
  }

  const checkProgress = () => {
    if (revealed) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const sampleStep = 6
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let cleared = 0
    let total = 0
    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const alpha = data[(y * width + x) * 4 + 3]
        if (alpha < 40) cleared++
        total++
      }
    }
    if (total > 0 && cleared / total > REVEAL_THRESHOLD) {
      setRevealed(true)
      onRevealed?.()
    }
  }

  const handleStart = (e) => {
    isScratching.current = true
    const { x, y } = getPos(e)
    scratchAt(x, y)
  }
  const handleMove = (e) => {
    if (!isScratching.current) return
    const { x, y } = getPos(e)
    scratchAt(x, y)
  }
  const handleEnd = () => {
    if (!isScratching.current) return
    isScratching.current = false
    checkProgress()
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden shadow-lg"
    >
      <div className="absolute inset-0">{children}</div>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full cursor-pointer touch-none transition-opacity duration-700 ${
          revealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  )
}
