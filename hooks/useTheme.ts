'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useUserPreferences } from './useUserPreferences'
import { useEffect, useRef } from 'react'

export function useTheme() {
  const { theme: nextTheme, setTheme: setNextTheme, ...nextThemeProps } = useNextTheme()
  const { theme: userTheme, updateTheme, isLoading } = useUserPreferences()
  const hasInitialized = useRef(false)

  // Sync next-themes with user preferences on initial load
  useEffect(() => {
    if (!isLoading && userTheme && !hasInitialized.current) {
      hasInitialized.current = true
      if (userTheme !== nextTheme) {
        setNextTheme(userTheme)
      }
    }
  }, [userTheme, nextTheme, setNextTheme, isLoading])

  // Function to change theme (updates both next-themes and user preferences)
  const setTheme = async (newTheme: string) => {
    // Update next-themes immediately for instant UI feedback
    setNextTheme(newTheme)
    
    // Update user preferences in database
    if (!isLoading) {
      await updateTheme(newTheme)
    }
  }

  return {
    theme: nextTheme,
    setTheme,
    isLoading: isLoading || !nextTheme,
    ...nextThemeProps,
  }
}