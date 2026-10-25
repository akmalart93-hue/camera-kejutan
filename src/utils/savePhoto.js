import { supabase } from '../lib/supabase'

const BUCKET = 'photobox-results'

/**
 * Ubah dataURL (PNG hasil gabungan) jadi Blob JPEG supaya ukurannya
 * kecil (~200-500 KB) dan hemat kuota penyimpanan gratis Supabase.
 */
function dataUrlToJpegBlob(dataUrl, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      // JPEG tidak mendukung transparan -> isi latar putih dulu
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Gagal membuat JPEG'))),
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => reject(new Error('Gagal membaca gambar hasil'))
    img.src = dataUrl
  })
}

/**
 * Simpan hasil photobox ke Supabase Storage (bucket private) +
 * catat di tabel photo_results. Dipanggil diam-diam di halaman hasil;
 * kalau gagal, tamu tidak terganggu.
 */
export async function savePhotoResult(dataUrl, slug) {
  const blob = await dataUrlToJpegBlob(dataUrl)
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)
  const path = `${slug || 'umum'}/${Date.now()}-${id}.jpg`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg' })
  if (uploadError) throw uploadError

  const { error: dbError } = await supabase
    .from('photo_results')
    .insert({ slug: slug || null, storage_path: path })
  if (dbError) throw dbError
}
