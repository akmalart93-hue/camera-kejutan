import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Ini akan muncul di console browser kalau .env belum diisi
  console.error(
    '[Supabase] URL atau Anon Key belum diset. Cek file .env kamu!'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
