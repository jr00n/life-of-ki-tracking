'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { useUserPreferences } from './useUserPreferences'
import { useToast } from './use-toast'
import type { WeeklyReflectionFormData } from '@/lib/validations/weekly-reflection'
import type { Database } from '@/types/database.types'

type WeeklySummary = Database['public']['Tables']['weekly_summaries']['Row']
type WeeklySummaryInsert = Database['public']['Tables']['weekly_summaries']['Insert']
type WeeklySummaryUpdate = Database['public']['Tables']['weekly_summaries']['Update']

export function useWeeklyReflection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { getWeekDates: getUserPreferencesWeekDates } = useUserPreferences()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [reflections, setReflections] = useState<WeeklySummary[]>([])

  // Get week start and end dates for a given date (uses user preferences)
  const getWeekDates = useCallback((date: Date = new Date()) => {
    return getUserPreferencesWeekDates(date)
  }, [getUserPreferencesWeekDates])

  // Get current week reflection
  const getCurrentWeekReflection = useCallback(async (): Promise<WeeklySummary | null> => {
    if (!user) return null
    
    setIsLoading(true)
    try {
      const { weekStart } = getWeekDates()
      
      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching current week reflection:', error)
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching current week reflection:', error)
      toast({
        title: 'Fout',
        description: 'Kon wekelijkse reflectie niet laden',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast, getWeekDates, getUserPreferencesWeekDates])

  // Get reflection for specific week
  const getReflectionForWeek = useCallback(async (weekStart: string): Promise<WeeklySummary | null> => {
    if (!user) return null
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStart)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching reflection for week:', error)
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching reflection for week:', error)
      toast({
        title: 'Fout',
        description: 'Kon wekelijkse reflectie niet laden',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  // Get all reflections for user (paginated)
  const getAllReflections = useCallback(async (limit: number = 10, offset: number = 0): Promise<WeeklySummary[]> => {
    if (!user) return []
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .not('personal_insight', 'is', null) // Only get reflections that have been filled out
        .order('week_start', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      setReflections(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching all reflections:', error)
      toast({
        title: 'Fout',
        description: 'Kon wekelijkse reflecties niet laden',
        variant: 'destructive',
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  // Save or update weekly reflection
  const saveReflection = useCallback(async (formData: WeeklyReflectionFormData, weekStart?: string): Promise<{ success: boolean }> => {
    if (!user || !user.id) {
      toast({
        title: 'Fout',
        description: 'Je moet ingelogd zijn om een reflectie op te slaan',
        variant: 'destructive',
      })
      return { success: false }
    }
    
    setIsLoading(true)
    try {
      const { weekStart: currentWeekStart, weekEnd } = weekStart 
        ? { weekStart, weekEnd: getWeekDates(new Date(weekStart)).weekEnd }
        : getWeekDates()
      
      // Check if reflection exists for this week
      const { data: existingReflection, error: fetchError } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', currentWeekStart)
        .maybeSingle()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing reflection:', fetchError)
        throw fetchError
      }
      
      let result
      
      if (existingReflection) {
        // Update existing reflection
        const updateData: WeeklySummaryUpdate = {
          ...formData,
        }
        
        result = await supabase
          .from('weekly_summaries')
          .update(updateData)
          .eq('id', existingReflection.id)
          .eq('user_id', user.id)
          .select()
          .single()
      } else {
        // Create new reflection
        const insertData: WeeklySummaryInsert = {
          user_id: user.id,
          week_start: currentWeekStart,
          week_end: weekEnd,
          ...formData,
          // Initialize other fields with defaults
          assignment_completed: false,
        }
        
        result = await supabase
          .from('weekly_summaries')
          .insert(insertData)
          .select()
          .single()
      }

      if (result.error) throw result.error

      toast({
        title: 'Gelukt!',
        description: existingReflection 
          ? 'Je wekelijkse reflectie is bijgewerkt' 
          : 'Je wekelijkse reflectie is opgeslagen',
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error saving reflection:', error)
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      let errorMsg = 'Onbekende fout'
      if (error && typeof error === 'object') {
        errorMsg = error.message || error.error?.message || error.details || JSON.stringify(error)
      } else if (typeof error === 'string') {
        errorMsg = error
      }
      
      toast({
        title: 'Fout',
        description: `Kon reflectie niet opslaan: ${errorMsg}`,
        variant: 'destructive',
      })
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast, getWeekDates, getUserPreferencesWeekDates])

  // Delete a reflection
  const deleteReflection = useCallback(async (reflectionId: string): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('weekly_summaries')
        .delete()
        .eq('id', reflectionId)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: 'Verwijderd',
        description: 'Wekelijkse reflectie is verwijderd',
      })
      
      return true
    } catch (error) {
      console.error('Error deleting reflection:', error)
      toast({
        title: 'Fout',
        description: 'Kon reflectie niet verwijderen',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, supabase, toast])

  // Get reflection statistics
  const getReflectionStats = useCallback(async () => {
    if (!user) return null
    
    try {
      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('movement_goal_achieved, nutrition_goal_achieved, week_start')
        .eq('user_id', user.id)
        .not('personal_insight', 'is', null) // Only completed reflections
        .order('week_start', { ascending: false })
        .limit(12) // Last 12 weeks

      if (error) throw error

      if (!data || data.length === 0) return null

      const totalReflections = data.length
      const movementGoalsAchieved = data.filter(r => r.movement_goal_achieved === true).length
      const nutritionGoalsAchieved = data.filter(r => r.nutrition_goal_achieved === true).length

      return {
        totalReflections,
        movementGoalSuccessRate: (movementGoalsAchieved / totalReflections) * 100,
        nutritionGoalSuccessRate: (nutritionGoalsAchieved / totalReflections) * 100,
        recentWeeks: data.map(r => ({
          weekStart: r.week_start,
          movementGoalAchieved: r.movement_goal_achieved,
          nutritionGoalAchieved: r.nutrition_goal_achieved,
        }))
      }
    } catch (error) {
      console.error('Error fetching reflection stats:', error)
      return null
    }
  }, [user, supabase])

  return {
    isLoading,
    reflections,
    getWeekDates,
    getCurrentWeekReflection,
    getReflectionForWeek,
    getAllReflections,
    saveReflection,
    deleteReflection,
    getReflectionStats,
  }
}