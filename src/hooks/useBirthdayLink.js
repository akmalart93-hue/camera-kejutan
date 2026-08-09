import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook untuk mengambil data "orang yang berulang tahun" berdasarkan slug
 * yang ada di URL (/#/ucapan/:slug).
 *
 * Return: { data, loading, error }
 * data berisi { id, slug, name, message, frame_url }
 */
export function useBirthdayLink(slug) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    let isMounted = true
    setLoading(true)

    supabase
      .from('birthday_links')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          setError(error)
        } else {
          setData(data)
        }
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  return { data, loading, error }
}
