import { useEffect, useRef, useState } from 'react'

/**
 * Hook untuk mengelola akses kamera (getUserMedia).
 * Dipakai di halaman Capture — bisa dipanggil ulang untuk beberapa
 * kali jepretan tanpa perlu minta izin berkali-kali.
 */
export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraState, setCameraState] = useState('idle') // idle | requesting | active | denied

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

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  // PENTING: elemen <video> baru pasti ada di DOM setelah cameraState
  // berubah jadi 'active'. Pasang srcObject di sini (bukan langsung di
  // dalam startCamera) supaya videoRef.current tidak null.
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraState])

  // Matikan kamera saat komponen di-unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

  return { videoRef, cameraState, startCamera, stopCamera }
}
