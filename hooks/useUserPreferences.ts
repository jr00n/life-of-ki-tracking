'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'
import type { Database } from '@/types/database.types'

type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

// Week days mapping
export const WEEK_DAYS = [
  { value: 0, label: 'Zondag' },
  { value: 1, label: 'Maandag' },
  { value: 2, label: 'Dinsdag' },
  { value: 3, label: 'Woensdag' },
  { value: 4, label: 'Donderdag' },
  { value: 5, label: 'Vrijdag' },
  { value: 6, label: 'Zaterdag' },
]

// Theme options mapping
export const THEME_OPTIONS = [
  { value: 'light', label: 'Licht', icon: '☀️' },
  { value: 'dark', label: 'Donker', icon: '🌙' },
  { value: 'system', label: 'Systeem', icon: '💻' },
]

const DEFAULT_WEEK_START_DAY = 1 // Monday
const DEFAULT_THEME = 'light' // Default to light theme

export function useUserPreferences() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [weekStartDay, setWeekStartDay] = useState<number>(DEFAULT_WEEK_START_DAY)
  const [theme, setTheme] = useState<string>(DEFAULT_THEME)

  // Get week start and end dates based on user preference
  const getWeekDates = useCallback((date: Date = new Date(), customWeekStartDay?: number) => {
    const start = new Date(date)
    const day = start.getDay()
    const weekStart = customWeekStartDay !== undefined ? customWeekStartDay : weekStartDay
    
    // Calculate the difference to get to the start of the week
    // If weekStart is 0 (Sunday), and today is Monday (1), we need to go back 1 day
    // If weekStart is 5 (Friday), and today is Monday (1), we need to go back 3 days
    let diff = day - weekStart
    if (diff < 0) {
      diff += 7
    }
    
    start.setDate(start.getDate() - diff)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    
    return {
      weekStart: start.toISOString().split('T')[0],
      weekEnd: end.toISOString().split('T')[0],
      weekStartDate: start,
      weekEndDate: end
    }
  }, [weekStartDay])

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading preferences:', error)
          throw error
        }

        if (data) {
          setPreferences(data)
          setWeekStartDay(data.week_start_day)
          setTheme(data.theme)
        } else {
          // Create default preferences if they don't exist
          const defaultPrefs = await createDefaultPreferences()
          if (defaultPrefs) {
            setPreferences(defaultPrefs)
            setWeekStartDay(defaultPrefs.week_start_day)
            setTheme(defaultPrefs.theme)
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error)
        // Use default if there's an error
        setWeekStartDay(DEFAULT_WEEK_START_DAY)
        setTheme(DEFAULT_THEME)
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [user, supabase])

  // Create default preferences for new users
  const createDefaultPreferences = useCallback(async (): Promise<UserPreferences | null> => {
    if (!user) return null

    try {
      const insertData: UserPreferencesInsert = {
        user_id: user.id,
        week_start_day: DEFAULT_WEEK_START_DAY,
        theme: DEFAULT_THEME,
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating default preferences:', error)
      return null
    }
  }, [user, supabase])

  // Update week start day preference
  const updateWeekStartDay = useCallback(async (newWeekStartDay: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Fout',
        description: 'Je moet ingelogd zijn om voorkeuren op te slaan',
        variant: 'destructive',
      })
      return false
    }

    setIsLoading(true)
    try {
      if (preferences) {
        // Update existing preferences
        const updateData: UserPreferencesUpdate = {
          week_start_day: newWeekStartDay,
        }

        const { data, error } = await supabase
          .from('user_preferences')
          .update(updateData)
          .eq('id', preferences.id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error

        setPreferences(data)
        setWeekStartDay(newWeekStartDay)
      } else {
        // Create new preferences
        const insertData: UserPreferencesInsert = {
          user_id: user.id,
          week_start_day: newWeekStartDay,
          theme: DEFAULT_THEME,
        }

        const { data, error } = await supabase
          .from('user_preferences')
          .insert(insertData)
          .select()
          .single()

        if (error) throw error

        setPreferences(data)
        setWeekStartDay(newWeekStartDay)
      }

      toast({
        title: 'Gelukt!',
        description: 'Je weekstart voorkeur is opgeslagen',
      })
      
      return true
    } catch (error) {
      console.error('Error updating week start day:', error)
      toast({
        title: 'Fout',
        description: 'Kon weekstart voorkeur niet opslaan',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, preferences, supabase, toast])

  // Update theme preference
  const updateTheme = useCallback(async (newTheme: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Fout',
        description: 'Je moet ingelogd zijn om voorkeuren op te slaan',
        variant: 'destructive',
      })
      return false
    }

    setIsLoading(true)
    try {
      if (preferences) {
        // Update existing preferences
        const updateData: UserPreferencesUpdate = {
          theme: newTheme,
        }

        const { data, error } = await supabase
          .from('user_preferences')
          .update(updateData)
          .eq('id', preferences.id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error

        setPreferences(data)
        setTheme(newTheme)
      } else {
        // Create new preferences
        const insertData: UserPreferencesInsert = {
          user_id: user.id,
          week_start_day: DEFAULT_WEEK_START_DAY,
          theme: newTheme,
        }

        const { data, error } = await supabase
          .from('user_preferences')
          .insert(insertData)
          .select()
          .single()

        if (error) throw error

        setPreferences(data)
        setTheme(newTheme)
      }

      toast({
        title: 'Gelukt!',
        description: 'Je thema voorkeur is opgeslagen',
      })
      
      return true
    } catch (error) {
      console.error('Error updating theme:', error)
      toast({
        title: 'Fout',
        description: 'Kon thema voorkeur niet opslaan',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, preferences, supabase, toast])

  // Get the label for the current week start day
  const getWeekStartDayLabel = useCallback((day: number = weekStartDay) => {
    const weekDay = WEEK_DAYS.find(d => d.value === day)
    return weekDay?.label || 'Maandag'
  }, [weekStartDay])

  // Get the label for the current theme
  const getThemeLabel = useCallback((themeValue: string = theme) => {
    const themeOption = THEME_OPTIONS.find(t => t.value === themeValue)
    return themeOption?.label || 'Systeem'
  }, [theme])

  return {
    isLoading,
    preferences,
    weekStartDay,
    theme,
    getWeekDates,
    updateWeekStartDay,
    updateTheme,
    getWeekStartDayLabel,
    getThemeLabel,
    WEEK_DAYS,
    THEME_OPTIONS,
  }
}