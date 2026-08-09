import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState({ name: '', message: '' })
  const [loadingList, setLoadingList] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState(null)
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    setLoadingList(true)
    const { data, error } = await supabase
      .from('birthday_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setLinks(data)
    setLoadingList(false)
  }

  // Slug unik dibuat dari nama + potongan random ID, contoh: "budi-a1b2c3d4"
  const generateSlug = (name) => {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const uniquePart = crypto.randomUUID().split('-')[0]
    return `${base || 'ucapan'}-${uniquePart}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim() || !form.message.trim()) {
      setFormError('Nama dan pesan wajib diisi.')
      return
    }

    setSubmitting(true)
    const slug = generateSlug(form.name)

    const { error } = await supabase.from('birthday_links').insert({
      slug,
      name: form.name.trim(),
      message: form.message.trim(),
    })

    if (error) {
      setFormError('Gagal menyimpan: ' + error.message)
    } else {
      setForm({ name: '', message: '' })
      fetchLinks()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus link ini? Tindakan ini tidak bisa dibatalkan.')) return
    await supabase.from('birthday_links').delete().eq('id', id)
    fetchLinks()
  }

  // Bangun URL publik lengkap dengan HashRouter (#/ucapan/slug)
  const getPublicUrl = (slug) => {
    return `${window.location.origin}${window.location.pathname}#/ucapan/${slug}`
  }

  const copyLink = async (slug) => {
    await navigator.clipboard.writeText(getPublicUrl(slug))
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">🎂 Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ---- Form: Buat Link Baru ---- */}
        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            ✨ Buat Link Ucapan Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama yang Berulang Tahun
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesan / Ucapan Ulang Tahun
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition resize-none"
                placeholder="Tulis ucapan spesialmu di sini..."
              />
            </div>

            {formError && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 active:scale-[0.98] text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Menyimpan…' : 'Buat Link'}
            </button>
          </form>
        </section>

        {/* ---- Daftar Link yang Sudah Dibuat ---- */}
        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            📋 Daftar Link ({links.length})
          </h2>

          {loadingList && <p className="text-gray-400 text-sm">Memuat…</p>}

          {!loadingList && links.length === 0 && (
            <p className="text-gray-400 text-sm">Belum ada link. Buat yang pertama di atas!</p>
          )}

          <ul className="divide-y divide-gray-100">
            {links.map((link) => (
              <li key={link.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{link.name}</p>
                  <p className="text-sm text-gray-500 truncate">{link.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{link.slug}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => copyLink(link.slug)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                  >
                    {copiedSlug === link.slug ? '✓ Tersalin' : 'Salin Link'}
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
