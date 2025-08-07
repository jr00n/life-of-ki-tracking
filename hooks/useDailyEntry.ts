'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'
import type { DailyEntryFormData } from '@/lib/validations/daily-entry'
import type { Database } from '@/types/database.types'

type DailyEntry = Database['public']['Tables']['daily_entries']['Row']
type DailyEntryInsert = Database['public']['Tables']['daily_entries']['Insert']
type DailyEntryUpdate = Database['public']['Tables']['daily_entries']['Update']

export function useDailyEntry() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [entries, setEntries] = useState<DailyEntry[]>([])

  // Get entry for specific date (or today if no date provided)
  const getEntryForDate = useCallback(async (dateString?: string): Promise<DailyEntry | null> => {
    if (!user) return null
    
    setIsLoading(true)
    try {
      const targetDate = dateString || new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', targetDate)
        .maybeSingle()

      if (error) {
        console.error('Error fetching entry for date:', error)
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching entry for date:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error,
        date: dateString
      })
      toast({
        title: 'Fout',
        description: error instanceof Error && error.message 
          ? `Kon dagelijkse entry niet laden: ${error.message}` 
          : 'Kon dagelijkse entry niet laden',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  // Get entries for a specific date range
  const getEntries = useCallback(async (startDate: string, endDate: string): Promise<DailyEntry[]> => {
    if (!user) return []
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: false })

      if (error) throw error

      setEntries(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching entries:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      toast({
        title: 'Fout',
        description: error instanceof Error && error.message 
          ? `Kon entries niet laden: ${error.message}` 
          : 'Kon entries niet laden',
        variant: 'destructive',
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  // Create or update entry for specific date (or today if no date provided)
  const saveEntry = useCallback(async (formData: DailyEntryFormData, entryDate?: string): Promise<{ success: boolean, entryId?: string }> => {
    console.log('=== saveEntry function START ===')
    console.log('saveEntry called with data:', formData)
    console.log('saveEntry called with entryDate:', entryDate)
    console.log('saveEntry: function properly defined and called')
    
    if (!user || !user.id) {
      console.log('saveEntry: No user logged in or user.id missing')
      console.log('User state:', user)
      toast({
        title: 'Fout',
        description: 'Je moet ingelogd zijn om een entry op te slaan',
        variant: 'destructive',
      })
      return { success: false }
    }
    
    console.log('saveEntry: Starting save process for user:', user.id)
    console.log('Full user object:', user)
    
    // Check current Supabase session (debugging - can be removed)
    // const { data: session } = await supabase.auth.getSession()
    // console.log('Current session available:', !!session)
    
    setIsLoading(true)
    try {
      const targetDate = entryDate || new Date().toISOString().split('T')[0]
      
      // Calculate sleep hours from bedtime and wake time
      const calculateSleepHours = (bedtime: string, wakeTime: string): number => {
        if (!bedtime || !wakeTime) return 0
        
        const [bedHour, bedMin] = bedtime.split(':').map(Number)
        const [wakeHour, wakeMin] = wakeTime.split(':').map(Number)
        
        let bedDate = new Date()
        bedDate.setHours(bedHour, bedMin, 0, 0)
        
        let wakeDate = new Date()
        wakeDate.setHours(wakeHour, wakeMin, 0, 0)
        
        // If wake time is before bed time, it's the next day
        if (wakeDate < bedDate) {
          wakeDate.setDate(wakeDate.getDate() + 1)
        }
        
        const diffMs = wakeDate.getTime() - bedDate.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        
        return Math.round(diffHours * 10) / 10 // Round to 1 decimal
      }

      const calculatedSleepHours = calculateSleepHours(
        formData.bedtime || '', 
        formData.wake_up_time || ''
      )

      // Check if entry exists for target date
      const { data: existingEntry, error: fetchError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', targetDate)
        .maybeSingle()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing entry:', fetchError)
        throw fetchError
      }
      
      const entryData: DailyEntryInsert = {
        user_id: user.id,
        entry_date: targetDate,
        ...formData,
        // Override sleep_hours with calculated value
        sleep_hours: calculatedSleepHours,
        // Convert empty strings to null for time fields (should not happen with required fields)
        wake_up_time: formData.wake_up_time?.trim() || null,
        bedtime: formData.bedtime?.trim() || null,
      }
      
      console.log('Prepared entry data with calculated sleep hours:', entryData)

      let result
      
      if (existingEntry) {
        // Update existing entry
        const updateData: DailyEntryUpdate = {
          ...formData,
          // Override sleep_hours with calculated value
          sleep_hours: calculatedSleepHours,
          // Convert empty strings to null for time fields (should not happen with required fields)
          wake_up_time: formData.wake_up_time?.trim() || null,
          bedtime: formData.bedtime?.trim() || null,
        }
        
        result = await supabase
          .from('daily_entries')
          .update(updateData)
          .eq('id', existingEntry.id)
          .eq('user_id', user.id)
          .select()
          .single()
      } else {
        // Create new entry
        result = await supabase
          .from('daily_entries')
          .insert(entryData)
          .select()
          .single()
      }

      if (result.error) throw result.error

      toast({
        title: 'Gelukt!',
        description: existingEntry 
          ? 'Je dagelijkse entry is bijgewerkt' 
          : 'Je dagelijkse entry is opgeslagen',
      })
      
      const successResult = { success: true, entryId: result.data.id }
      console.log('saveEntry: About to return success result:', successResult)
      return successResult
    } catch (error) {
      console.log('FULL ERROR OBJECT:', error)
      console.log('ERROR STRING:', String(error))
      console.log('ERROR JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      
      const errorMsg = error?.message || error?.error?.message || 'Unknown error'
      console.log('EXTRACTED ERROR MESSAGE:', errorMsg)
      
      toast({
        title: 'Fout',
        description: `Kon entry niet opslaan: ${errorMsg}`,
        variant: 'destructive',
      })
      const errorResult = { success: false }
      console.log('saveEntry: About to return error result:', errorResult)
      return errorResult
    } finally {
      setIsLoading(false)
    }
    
    // This should never be reached, but add as fallback
    console.error('saveEntry: Unexpected code path - no return statement reached')
    return { success: false }
  }, [user, supabase, toast])

  // Delete an entry
  const deleteEntry = useCallback(async (entryId: string): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('daily_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Verwijderd',
        description: 'Entry is verwijderd',
      })
      
      return true
    } catch (error) {
      console.error('Error deleting entry:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      toast({
        title: 'Fout',
        description: error instanceof Error && error.message 
          ? `Kon entry niet verwijderen: ${error.message}` 
          : 'Kon entry niet verwijderen',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  // Get entry statistics
  const getStats = useCallback(async (days: number = 30) => {
    if (!user) return null
    
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)
      
      const { data, error } = await supabase
        .from('daily_entries')
        .select('mood, energy_level, sleep_hours, exercise_minutes, meditation_minutes')
        .eq('user_id', user.id)
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .lte('entry_date', endDate.toISOString().split('T')[0])

      if (error) throw error

      if (!data || data.length === 0) return null

      // Calculate averages
      const totalEntries = data.length
      const stats = {
        totalEntries,
        averageMood: data.reduce((sum, entry) => sum + (entry.mood || 0), 0) / totalEntries,
        averageEnergy: data.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / totalEntries,
        averageSleep: data.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / totalEntries,
        totalExercise: data.reduce((sum, entry) => sum + (entry.exercise_minutes || 0), 0),
        totalMeditation: data.reduce((sum, entry) => sum + (entry.meditation_minutes || 0), 0),
      }

      return stats
    } catch (error) {
      console.error('Error fetching stats:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      return null
    }
  }, [user, supabase])

  // Get analytics data with trends and streaks
  const getAnalytics = useCallback(async (days: number = 30) => {
    if (!user) return null
    
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - days)
      
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .lte('entry_date', endDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: true })

      if (error) throw error

      if (!data || data.length === 0) {
        return null
      }

      const totalEntries = data.length

      // Calculate basic stats
      const basicStats = {
        totalEntries,
        averageMood: data.reduce((sum, entry) => sum + (entry.mood || 0), 0) / totalEntries,
        averageEnergy: data.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / totalEntries,
        averageSleep: data.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / totalEntries,
        totalExercise: data.reduce((sum, entry) => sum + (entry.exercise_minutes || 0), 0),
        totalMeditation: data.reduce((sum, entry) => sum + (entry.meditation_minutes || 0), 0),
      }

      // Calculate trends (comparing first half vs second half of period)
      const halfPoint = Math.floor(data.length / 2)
      const firstHalf = data.slice(0, halfPoint)
      const secondHalf = data.slice(halfPoint)

      const calculateTrend = (firstHalfAvg: number, secondHalfAvg: number) => {
        const difference = secondHalfAvg - firstHalfAvg
        if (Math.abs(difference) < 0.2) return 'stable'
        return difference > 0 ? 'improving' : 'declining'
      }

      const firstHalfMood = firstHalf.reduce((sum, entry) => sum + (entry.mood || 0), 0) / firstHalf.length
      const secondHalfMood = secondHalf.reduce((sum, entry) => sum + (entry.mood || 0), 0) / secondHalf.length
      const moodTrend = calculateTrend(firstHalfMood, secondHalfMood)

      const firstHalfEnergy = firstHalf.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / firstHalf.length
      const secondHalfEnergy = secondHalf.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / secondHalf.length
      const energyTrend = calculateTrend(firstHalfEnergy, secondHalfEnergy)

      const firstHalfSleep = firstHalf.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / firstHalf.length
      const secondHalfSleep = secondHalf.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / secondHalf.length
      const sleepTrend = calculateTrend(firstHalfSleep, secondHalfSleep)

      // Calculate current and longest streak
      const { currentStreak, longestStreak } = await calculateStreaks()

      return {
        ...basicStats,
        moodTrend,
        energyTrend,
        sleepTrend,
        currentStreak,
        longestStreak,
      }
    } catch (error) {
      console.error('Error fetching analytics:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      })
      return null
    }
  }, [user, supabase])

  // Calculate streak data
  const calculateStreaks = useCallback(async () => {
    if (!user) return { currentStreak: 0, longestStreak: 0 }

    try {
      // Get all entries ordered by date (descending for current streak)
      const { data, error } = await supabase
        .from('daily_entries')
        .select('entry_date')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        return { currentStreak: 0, longestStreak: 0 }
      }

      // Calculate current streak (from today backwards)
      let currentStreak = 0
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]
      
      // Check if there's an entry today
      const todayEntry = data.find(entry => entry.entry_date === todayString)
      if (todayEntry) {
        currentStreak = 1
        
        // Count consecutive days backwards
        for (let i = 1; i < data.length; i++) {
          const expectedDate = new Date(today)
          expectedDate.setDate(today.getDate() - i)
          const expectedDateString = expectedDate.toISOString().split('T')[0]
          
          const entryExists = data.find(entry => entry.entry_date === expectedDateString)
          if (entryExists) {
            currentStreak++
          } else {
            break
          }
        }
      }

      // Calculate longest streak ever
      const sortedData = [...data].sort((a, b) => a.entry_date.localeCompare(b.entry_date))
      let longestStreak = 0
      let tempStreak = 0
      let lastDate: Date | null = null

      for (const entry of sortedData) {
        const entryDate = new Date(entry.entry_date)
        
        if (lastDate === null) {
          tempStreak = 1
        } else {
          const diffTime = entryDate.getTime() - lastDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            tempStreak++
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
        
        lastDate = entryDate
      }
      longestStreak = Math.max(longestStreak, tempStreak)

      return { currentStreak, longestStreak }
    } catch (error) {
      console.error('Error calculating streaks:', error)
      return { currentStreak: 0, longestStreak: 0 }
    }
  }, [user, supabase])

  return {
    isLoading,
    entries,
    getEntryForDate,
    getEntries,
    saveEntry,
    deleteEntry,
    getStats,
    getAnalytics,
  }
}