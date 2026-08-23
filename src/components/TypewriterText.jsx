import { useEffect, useState } from 'react'

/**
 * Menampilkan teks seolah diketik huruf demi huruf — dipakai saat pesan
 * baru saja "dibuka" biar terasa lebih hidup, bukan cuma muncul instan.
 */
export default function TypewriterText({ text, speed = 26, className, style }) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setShown('')
    setDone(false)
    if (!text) return undefined

    let i = 0
    const interval = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <p className={className} style={style}>
      {shown}
      {!done && (
        <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse align-middle" />
      )}
    </p>
  )
}
