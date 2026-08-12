import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { supabase } from '../../lib/supabase'

const REVEAL_STYLES = [
  { id: 'scratch', label: 'Scratch Card', emoji: '🪙', desc: 'Digosok pakai jari' },
  { id: 'tap-balloons', label: 'Tap Balon', emoji: '🎈', desc: 'Pecahkan semua balon' },
  { id: 'simple', label: 'Langsung', emoji: '✨', desc: 'Tanpa interaksi' },
]

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState({ name: '', message: '', reveal_style: 'scratch' })
  const [loadingList, setLoadingList] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState(null)
  const [formError, setFormError] = useState('')
  const [qrModal, setQrModal] = useState(null) // { name, slug, dataUrl } | null
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
      reveal_style: form.reveal_style,
    })

    if (error) {
      setFormError('Gagal menyimpan: ' + error.message)
    } else {
      setForm({ name: '', message: '', reveal_style: 'scratch' })
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

  const openQrModal = async (link) => {
    setQrModal({ name: link.name, slug: link.slug, dataUrl: null })
    try {
      const dataUrl = await QRCode.toDataURL(getPublicUrl(link.slug), {
        width: 600,
        margin: 2,
        color: { dark: '#831843', light: '#ffffff' },
      })
      setQrModal({ name: link.name, slug: link.slug, dataUrl })
    } catch (err) {
      console.error(err)
      setQrModal(null)
      alert('Gagal membuat QR code.')
    }
  }

  const downloadQr = () => {
    if (!qrModal?.dataUrl) return
    const a = document.createElement('a')
    a.href = qrModal.dataUrl
    a.download = `qr-${qrModal.slug}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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

            {/* ---- Setel gaya interaksi buka pesan ---- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gaya Buka Pesan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {REVEAL_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setForm({ ...form, reveal_style: style.id })}
                    className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-center transition ${
                      form.reveal_style === style.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl leading-none">{style.emoji}</span>
                    <span className="text-xs font-semibold text-gray-700">{style.label}</span>
                    <span className="text-[10px] text-gray-400">{style.desc}</span>
                  </button>
                ))}
              </div>
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
            {links.map((link) => {
              const style = REVEAL_STYLES.find((s) => s.id === link.reveal_style) || REVEAL_STYLES[0]
              return (
                <li key={link.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-gray-800 truncate">{link.name}</p>
                      <span className="text-xs shrink-0" title={style.label}>{style.emoji}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{link.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{link.slug}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => copyLink(link.slug)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                    >
                      {copiedSlug === link.slug ? '✓ Tersalin' : 'Salin Link'}
                    </button>
                    <button
                      onClick={() => openQrModal(link)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </main>

      {/* ---- Modal QR Code ---- */}
      {qrModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-gray-800 mb-1">QR untuk {qrModal.name}</h3>
            <p className="text-xs text-gray-400 mb-4">
              Scan pakai kamera HP untuk membuka ucapannya
            </p>

            <div className="aspect-square rounded-xl bg-gray-50 flex items-center justify-center mb-4 overflow-hidden">
              {qrModal.dataUrl ? (
                <img src={qrModal.dataUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-pink-400" />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setQrModal(null)}
                className="flex-1 bg-gray-100 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-200 transition text-sm"
              >
                Tutup
              </button>
              <button
                onClick={downloadQr}
                disabled={!qrModal.dataUrl}
                className="flex-1 bg-pink-500 text-white font-medium py-2.5 rounded-lg hover:bg-pink-600 transition text-sm disabled:opacity-50"
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
