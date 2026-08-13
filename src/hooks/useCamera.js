import { useEffect, useRef, useState } from 'react'

/**
 * Hook untuk mengelola akses kamera (getUserMedia).
 * Dipakai di halaman Capture — bisa dipanggil ulang untuk beberapa
 * kali jepretan tanpa perlu minta izin berkali-kali. Mendukung
 * switch antara kamera depan (selfie) dan belakang.
 */
export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraState, setCameraState] = useState('idle') // idle | requesting | active | denied
  const [facingMode, setFacingMode] = useState('user') // 'user' (depan) | 'environment' (belakang)
  const [switching, setSwitching] = useState(false)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const startCamera = async (mode = facingMode) => {
    setCameraState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setFacingMode(mode)
      setCameraState('active')
    } catch (err) {
      console.error(err)
      setCameraState('denied')
    }
  }

  // Ganti kamera depan <-> belakang tanpa perlu minta izin lagi
  // (izin kamera sudah didapat sekali di awal, browser tidak akan nanya ulang)
  const switchCamera = async () => {
    if (switching) return
    setSwitching(true)
    stopCamera()
    const nextMode = facingMode === 'user' ? 'environment' : 'user'
    await startCamera(nextMode)
    setSwitching(false)
  }

  // PENTING: elemen <video> baru pasti ada di DOM setelah cameraState
  // berubah jadi 'active'. Pasang srcObject di sini (bukan langsung di
  // dalam startCamera) supaya videoRef.current tidak null.
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraState, facingMode])

  // Matikan kamera saat komponen di-unmount
  useEffect(() => {
    return () => stopCamera()
  }, [])

  return { videoRef, cameraState, facingMode, switching, startCamera, stopCamera, switchCamera }
}
