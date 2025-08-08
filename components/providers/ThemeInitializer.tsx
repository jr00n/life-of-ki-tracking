'use client'

import { useEffect } from 'react'
import { useTheme as useNextTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function ThemeInitializer() {
  const { user } = useAuth()
  const { setTheme, theme } = useNextTheme()
  const supabase = createClient()

  useEffect(() => {
    const initializeTheme = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!error && data?.theme) {
          if (data.theme !== theme) {
            setTheme(data.theme)
          }
        }
      } catch (error) {
        console.error('Error initializing theme:', error)
      }
    }

    initializeTheme()
  }, [user, supabase, setTheme, theme])

  return null
}