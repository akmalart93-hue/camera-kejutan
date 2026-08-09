import { createContext, useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'

import Landing from './pages/public/Landing'
import Result from './pages/public/Result'
import Wishes from './pages/public/Wishes'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminRoute from './components/AdminRoute'

// Context sederhana untuk "menitipkan" foto yang baru di-capture
// dari Halaman 1 (Landing) ke Halaman 2 (Result), tanpa perlu
// menyimpannya ke database. Ini aman dipakai karena HashRouter
// tidak me-reload halaman saat berpindah route.
export const PhotoContext = createContext(null)

export default function App() {
  const [capturedPhoto, setCapturedPhoto] = useState(null)

  return (
    <PhotoContext.Provider value={{ capturedPhoto, setCapturedPhoto }}>
      {/*
        Kenapa HashRouter?
        GitHub Pages adalah static hosting murni: server tidak tahu
        cara meng-handle path seperti /ucapan/budi-123 (akan 404).
        HashRouter menaruh semua path SETELAH tanda "#", contoh:
        https://user.github.io/repo/#/ucapan/budi-123
        Browser tidak pernah mengirim bagian setelah "#" ke server,
        jadi server GitHub Pages selalu hanya melayani index.html,
        lalu React Router yang mengambil alih routing di sisi klien.
      */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          {/* ==== ALUR PUBLIK ==== */}
          <Route path="/ucapan/:slug" element={<Landing />} />
          <Route path="/ucapan/:slug/result" element={<Result />} />
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

          {/* Fallback kalau path tidak dikenali */}
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
