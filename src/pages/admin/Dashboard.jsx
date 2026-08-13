import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { supabase } from '../../lib/supabase'
import { FONT_OPTIONS, DEFAULT_FONT_ID, COLOR_PRESETS, DEFAULT_TEXT_COLOR, DEFAULT_ACCENT_COLOR, getFontFamily } from '../../data/fontOptions'

const REVEAL_STYLES = [
  { id: 'scratch', label: 'Scratch Card', emoji: '🪙', desc: 'Digosok pakai jari' },
  { id: 'tap-balloons', label: 'Tap Balon', emoji: '🎈', desc: 'Pecahkan semua balon' },
  { id: 'simple', label: 'Langsung', emoji: '✨', desc: 'Tanpa interaksi' },
]

// Preset cepat per jenis acara — isi otomatis judul & emoji, admin masih
// bebas edit lagi manual sesudahnya kalau mau
const OCCASION_PRESETS = [
  { label: 'Ulang Tahun', emoji: '🎂🎉', title: 'Selamat Ulang Tahun' },
  { label: 'Pernikahan', emoji: '💍💕', title: 'Happy Wedding' },
  { label: 'Wisuda', emoji: '🎓✨', title: 'Selamat Wisuda' },
  { label: 'Kelahiran', emoji: '👶🍼', title: 'Selamat atas Kelahiran' },
  { label: 'Umum', emoji: '🎊🎉', title: 'Selamat untuk' },
]

const INITIAL_FORM = {
  name: '',
  message: '',
  greeting_title: 'Selamat Ulang Tahun',
  greeting_emoji: '🎂🎉',
  reveal_style: 'scratch',
  font_family: DEFAULT_FONT_ID,
  text_color: DEFAULT_TEXT_COLOR,
  accent_color: DEFAULT_ACCENT_COLOR,
  event_date: '',
}

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
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

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }))

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
      greeting_title: form.greeting_title.trim() || 'Selamat untuk',
      greeting_emoji: form.greeting_emoji.trim() || '🎉',
      reveal_style: form.reveal_style,
      font_family: form.font_family,
      text_color: form.text_color,
      accent_color: form.accent_color,
      event_date: form.event_date || null,
    })

    if (error) {
      setFormError('Gagal menyimpan: ' + error.message)
    } else {
      setForm(INITIAL_FORM)
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

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">🎉 Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* ---- Form + Live Preview: Buat Link Baru ---- */}
        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            ✨ Buat Link Ucapan Baru
          </h2>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* ---- Kolom form ---- */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
              {/* ---- Preset jenis acara ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Acara <span className="text-gray-400 font-normal">(isi cepat, bisa diedit lagi)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_PRESETS.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => updateForm({ greeting_title: o.title, greeting_emoji: o.emoji })}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition"
                    >
                      {o.emoji.slice(0, 2)} {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Ucapan
                  </label>
                  <input
                    type="text"
                    value={form.greeting_title}
                    onChange={(e) => updateForm({ greeting_title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                    placeholder="Contoh: Selamat Ulang Tahun"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={form.greeting_emoji}
                    onChange={(e) => updateForm({ greeting_emoji: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition text-center"
                    placeholder="🎉"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                  placeholder="Contoh: Budi & Siti / Budi Santoso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan / Ucapan
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => updateForm({ message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition resize-none"
                  placeholder="Tulis ucapan spesialmu di sini..."
                />
              </div>

              {/* ---- Font ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Teks</label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateForm({ font_family: f.id })}
                      className={`px-2 py-2.5 rounded-xl border-2 text-center transition ${
                        form.font_family === f.id
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg leading-none" style={{ fontFamily: f.cssFamily }}>Aa</div>
                      <div className="text-[10px] text-gray-500 mt-1">{f.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ---- Warna ---- */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warna Teks</label>
                  <ColorPicker value={form.text_color} onChange={(c) => updateForm({ text_color: c })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warna Judul</label>
                  <ColorPicker value={form.accent_color} onChange={(c) => updateForm({ accent_color: c })} />
                </div>
              </div>

              {/* ---- Gaya interaksi ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gaya Buka Pesan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {REVEAL_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => updateForm({ reveal_style: style.id })}
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

              {/* ---- Tanggal buka ---- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kunci Sampai Tanggal <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="date"
                  value={form.event_date}
                  min={todayStr}
                  onChange={(e) => updateForm({ event_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Kosongkan kalau link boleh langsung dibuka kapan saja. Kalau diisi,
                  penerima akan lihat pesan "belum waktunya" sampai tanggal itu tiba.
                </p>
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

            {/* ---- Kolom live preview ---- */}
            <div className="lg:col-span-2">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Live Preview
              </p>
              <div className="sticky top-20 rounded-2xl bg-gradient-to-b from-yellow-50 via-pink-50 to-purple-100 p-5 border border-gray-100">
                <div className="text-center">
                  <span className="text-4xl block mb-2">{form.greeting_emoji || '🎉'}</span>
                  <p className="text-sm text-gray-500">{form.greeting_title || 'Selamat untuk'},</p>
                  <h3
                    className="text-lg font-bold mb-3 break-words"
                    style={{ color: form.accent_color }}
                  >
                    {form.name.trim() || 'Nama'}!
                  </h3>
                  <div className="bg-white/90 rounded-xl p-4 text-left mb-3">
                    <p
                      className="text-sm leading-relaxed whitespace-pre-line break-words"
                      style={{ fontFamily: getFontFamily(form.font_family), color: form.text_color }}
                    >
                      {form.message.trim() || 'Pesan ucapanmu akan muncul di sini...'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <span>{REVEAL_STYLES.find((s) => s.id === form.reveal_style)?.emoji}</span>
                    <span>{REVEAL_STYLES.find((s) => s.id === form.reveal_style)?.label}</span>
                  </div>
                  {form.event_date && (
                    <div className="mt-2 inline-flex items-center gap-1 text-xs bg-white/80 px-2.5 py-1 rounded-full text-gray-500">
                      🔒 Terbuka {new Date(`${form.event_date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
              const isLocked = link.event_date && link.event_date > todayStr
              return (
                <li key={link.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-gray-800 truncate">{link.name}</p>
                      <span className="text-xs shrink-0" title={style.label}>{style.emoji}</span>
                      {isLocked && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full shrink-0">
                          🔒 {link.event_date}
                        </span>
                      )}
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

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {COLOR_PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-6 h-6 rounded-full border-2 transition ${
            value === c ? 'border-gray-700 scale-110' : 'border-gray-200'
          }`}
          style={{ backgroundColor: c }}
          aria-label={`Warna ${c}`}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer"
        title="Warna custom"
      />
    </div>
  )
}
