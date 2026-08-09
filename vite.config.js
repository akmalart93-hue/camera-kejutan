import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ====================================================================
// PENTING: Ganti 'birthday-photobox' di bawah dengan NAMA REPOSITORY
// GitHub kamu (persis, huruf besar/kecil sensitif).
// Contoh: kalau URL repo kamu github.com/budi/ucapan-ultah,
// maka base harus '/ucapan-ultah/'
// ====================================================================
export default defineConfig({
  plugins: [react()],
  base: '/camera-kejutan/',
})
