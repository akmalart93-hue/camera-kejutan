import { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoContext } from '../../App'
import { useBirthdayLink } from '../../hooks/useBirthdayLink'

export default function Landing() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: birthday, loading, error } = useBirthdayLink(slug)
  const { setSelectedFrame, setCapturedPhotos, setFinalPhoto } = useContext(PhotoContext)

  // Reset state photobox tiap kali link ini dibuka dari awal
  useEffect(() => {
    setSelectedFrame(null)
    setCapturedPhotos([])
    setFinalPhoto(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <CenteredMessage emoji="⏳" text="Memuat..." />
  if (error || !birthday) {
    return (
      <CenteredMessage
        emoji="😕"
        text="Link ini tidak ditemukan. Cek kembali link yang kamu terima."
      />
    )
  }

  // Kalau admin menyetel tanggal, link belum bisa diakses sebelum tanggal itu
  const todayStr = new Date().toISOString().slice(0, 10)
  const isLocked = birthday.event_date && birthday.event_date > todayStr

  if (isLocked) {
    const eventDate = new Date(`${birthday.event_date}T00:00:00`)
    const formatted = eventDate.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-white flex flex-col items-center justify-center px-4 py-8 text-center">
        <span className="text-6xl mb-4">🔒</span>
        <p className="text-lg text-gray-500">Halo, {birthday.name}!</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Belum waktunya nih...</h1>
        <p className="text-gray-500 max-w-xs mx-auto text-sm">
          Ada kejutan yang lagi disiapkan untukmu. Balik lagi ke link ini pada:
        </p>
        <p className="text-pink-500 font-semibold mt-2">{formatted}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-white flex flex-col items-center justify-center px-4 py-8 text-center">
      <span className="text-6xl mb-4 animate-pop-in">🎉</span>
      <p className="text-lg text-gray-500">Halo,</p>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">{birthday.name}!</h1>
      <p className="text-gray-500 max-w-xs mx-auto text-sm mb-8">
        Ada kejutan spesial untukmu. Tapi sebelum itu, yuk mampir dulu ke
        photobox — pilih frame favoritmu & ambil beberapa foto seru!
      </p>
      <button
        onClick={() => navigate(`/ucapan/${slug}/frame`)}
        className="bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg transition"
      >
        Mulai Photobox 📸
      </button>
    </div>
  )
}

function CenteredMessage({ emoji, text }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gray-50">
      <span className="text-5xl mb-3">{emoji}</span>
      <p className="text-gray-600">{text}</p>
    </div>
  )
}
