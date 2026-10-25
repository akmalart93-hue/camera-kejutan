import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const BUCKET = 'photobox-results'

export default function Photos() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterSlug, setFilterSlug] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    const { data: rows, error: dbError } = await supabase
      .from('photo_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    const list = rows || []
    let urlMap = {}

    if (list.length) {
      // URL sementara (berlaku 1 jam) dengan header download
      const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(
          list.map((r) => r.storage_path),
          3600,
          { download: true }
        )
      if (signError) setError(signError.message)
      urlMap = Object.fromEntries(
        (signed || []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl])
      )
    }

    setItems(list.map((r) => ({ ...r, url: urlMap[r.storage_path] })))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (item) => {
    if (!window.confirm('Hapus foto ini secara permanen?')) return
    const { error: rmError } = await supabase.storage.from(BUCKET).remove([item.storage_path])
    if (rmError) return alert('Gagal menghapus file: ' + rmError.message)
    const { error: delError } = await supabase.from('photo_results').delete().eq('id', item.id)
    if (delError) return alert('Gagal menghapus catatan: ' + delError.message)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleDownload = (item) => {
    if (!item.url) return
    const a = document.createElement('a')
    a.href = item.url
    a.download = item.storage_path.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const slugs = [...new Set(items.map((i) => i.slug).filter(Boolean))]
  const visible = filterSlug ? items.filter((i) => i.slug === filterSlug) : items

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">📷 Hasil Foto Tamu</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-sm text-pink-500 hover:text-pink-700 font-medium"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <p className="text-sm text-gray-500">
            {visible.length} foto{filterSlug ? ` (link: ${filterSlug})` : ''}
          </p>
          {slugs.length > 1 && (
            <select
              value={filterSlug}
              onChange={(e) => setFilterSlug(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1 bg-white"
            >
              <option value="">Semua link</option>
              {slugs.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <button onClick={load} className="text-sm text-gray-500 underline ml-auto">
            Muat ulang
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
            {error}. Pastikan SQL <code>supabase/photo_results_setup.sql</code> sudah dijalankan.
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-200 border-t-pink-500" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Belum ada foto yang tersimpan.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visible.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border p-2">
                {item.url ? (
                  <img
                    src={item.url}
                    alt="Hasil photobox"
                    loading="lazy"
                    className="w-full rounded-lg bg-gray-100"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    Tidak bisa dimuat
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(item.created_at).toLocaleString('id-ID')}
                </p>
                {item.slug && <p className="text-xs text-gray-400 truncate">{item.slug}</p>}
                <div className="flex gap-3 mt-2 text-sm">
                  <button
                    onClick={() => handleDownload(item)}
                    disabled={!item.url}
                    className="text-pink-500 font-medium disabled:opacity-40"
                  >
                    ⬇️ Unduh
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-red-500 font-medium ml-auto"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
