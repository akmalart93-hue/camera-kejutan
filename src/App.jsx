import { createContext, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

import Landing from './pages/public/Landing'
import FrameGallery from './pages/public/FrameGallery'
import CustomFrameBuilder from './pages/public/CustomFrameBuilder'
import Capture from './pages/public/Capture'
import Result from './pages/public/Result'
import Wishes from './pages/public/Wishes'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminRoute from './components/AdminRoute'

// Context untuk "menitipkan" frame yang dipilih & foto-foto yang
// diambil selama alur photobox, tanpa perlu simpan ke database.
// Aman dipakai karena HashRouter tidak me-reload halaman saat
// berpindah antar-route dalam satu kunjungan.
export const PhotoContext = createContext(null)

export default function App() {
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [capturedPhotos, setCapturedPhotos] = useState([])
  const [finalPhoto, setFinalPhoto] = useState(null)

  return (
    <PhotoContext.Provider
      value={{
        selectedFrame, setSelectedFrame,
        capturedPhotos, setCapturedPhotos,
        finalPhoto, setFinalPhoto,
      }}
    >
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          {/* ==== ALUR PUBLIK ====
              1. /ucapan/:slug        -> sapaan + tombol mulai
              2. /ucapan/:slug/frame  -> galeri pilih frame (per kategori)
              3. /ucapan/:slug/foto   -> jepret foto beberapa kali + retake
              4. /ucapan/:slug/hasil  -> hasil gabungan (canvas) + download
              5. /ucapan/:slug/wishes -> scratch card ucapan + confetti
          */}
          <Route path="/ucapan/:slug" element={<Landing />} />
          <Route path="/ucapan/:slug/frame" element={<FrameGallery />} />
          <Route path="/ucapan/:slug/frame/custom" element={<CustomFrameBuilder />} />
          <Route path="/ucapan/:slug/foto" element={<Capture />} />
          <Route path="/ucapan/:slug/hasil" element={<Result />} />
          <Route path="/ucapan/:slug/wishes" element={<Wishes />} />

          {/* ==== ALUR ADMIN ==== */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </PhotoContext.Provider>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-50">
      <span className="text-5xl mb-3">🔍</span>
      <h1 className="text-xl font-bold text-gray-800">Halaman tidak ditemukan</h1>
      <p className="text-gray-500 mt-1">Periksa kembali link yang kamu buka.</p>
    </div>
  )
}
