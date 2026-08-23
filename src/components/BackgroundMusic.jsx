import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

/**
 * Pemutar musik latar untuk halaman ucapan. Browser memblokir audio
 * bersuara autoplay tanpa interaksi user — jadi play() dipanggil lewat
 * ref dari tempat lain (saat user membuka amplop/gosok kartu/dst, yang
 * itu sendiri sudah termasuk "interaksi user" sehingga diizinkan browser).
 * Kalau tetap diblokir (edge case), tombol mute/play ini jadi fallback
 * manual buat user mulai musiknya sendiri.
 */
const BackgroundMusic = forwardRef(function BackgroundMusic({ url }, ref) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useImperativeHandle(ref, () => ({
    play: () => {
      if (!audioRef.current) return
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true)
          setBlocked(false)
        })
        .catch(() => setBlocked(true))
    },
  }))

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => {
          setPlaying(true)
          setBlocked(false)
        })
        .catch(() => setBlocked(true))
    }
  }

  if (!url) return null

  return (
    <>
      <audio ref={audioRef} src={url} loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? 'Matikan musik' : 'Putar musik'}
        className="fixed bottom-5 right-5 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-lg hover:scale-105 active:scale-95 transition"
      >
        {playing ? '🔊' : '🔇'}
      </button>
      {blocked && !playing && (
        <p className="fixed bottom-[4.5rem] right-5 z-20 text-[10px] bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow text-gray-500 max-w-[140px] text-right">
          Ketuk 🔇 buat nyalain musik
        </p>
      )}
    </>
  )
})

export default BackgroundMusic
