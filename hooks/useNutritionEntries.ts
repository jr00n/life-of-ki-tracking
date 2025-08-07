'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NutritionEntry, NutritionEntryInsert, NutritionEntryUpdate } from '@/types/database.types'

export interface NutritionEntryWithTime extends Omit<NutritionEntry, 'time_consumed'> {
  time_consumed: string // TIME format "HH:MM"
}

export function useNutritionEntries(dailyEntryId: string | null) {
  const [entries, setEntries] = useState<NutritionEntryWithTime[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [foodUsageCount, setFoodUsageCount] = useState<Map<string, number>>(new Map())
  const supabase = createClient()

  // Load nutrition entries for the daily entry
  const loadEntries = async () => {
    if (!dailyEntryId) {
      setEntries([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('daily_entry_id', dailyEntryId)
        .order('time_consumed', { ascending: true })

      if (error) throw error

      setEntries(data || [])
      setError(null)
    } catch (err) {
      console.error('Error loading nutrition entries:', err)
      setError('Kon voeding entries niet laden')
    } finally {
      setLoading(false)
    }
  }

  // Add new nutrition entry
  const addEntry = async (timeConsumed: string, foodDescription: string) => {
    if (!dailyEntryId) {
      throw new Error('Geen daily entry beschikbaar. Probeer eerst een volledige dagelijkse entry aan te maken.')
    }

    try {
      const insertData: NutritionEntryInsert = {
        daily_entry_id: dailyEntryId,
        time_consumed: timeConsumed,
        food_description: foodDescription
      }

      const { data, error } = await supabase
        .from('nutrition_entries')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      // Add to local state and sort
      const newEntry = data as NutritionEntryWithTime
      setEntries(prev => [...prev, newEntry].sort((a, b) => 
        a.time_consumed.localeCompare(b.time_consumed)
      ))
      
      // Track usage for auto-favorites (after 3 uses, it becomes a favorite)
      await trackFoodUsage(foodDescription, timeConsumed)

      return newEntry
    } catch (err) {
      console.error('Error adding nutrition entry:', err)
      throw new Error('Kon voeding entry niet toevoegen')
    }
  }

  // Update existing nutrition entry
  const updateEntry = async (id: string, timeConsumed: string, foodDescription: string) => {
    try {
      const updateData: NutritionEntryUpdate = {
        time_consumed: timeConsumed,
        food_description: foodDescription
      }

      const { data, error } = await supabase
        .from('nutrition_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state and re-sort
      const updatedEntry = data as NutritionEntryWithTime
      setEntries(prev => 
        prev.map(entry => entry.id === id ? updatedEntry : entry)
           .sort((a, b) => a.time_consumed.localeCompare(b.time_consumed))
      )

      return updatedEntry
    } catch (err) {
      console.error('Error updating nutrition entry:', err)
      throw new Error('Kon voeding entry niet bijwerken')
    }
  }

  // Delete nutrition entry
  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (err) {
      console.error('Error deleting nutrition entry:', err)
      throw new Error('Kon voeding entry niet verwijderen')
    }
  }
  
  // Track food usage for auto-favorites
  const trackFoodUsage = async (foodDescription: string, timeConsumed: string) => {
    try {
      // Count how many times this exact food has been used in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: similarEntries, error } = await supabase
        .from('nutrition_entries')
        .select('id')
        .eq('food_description', foodDescription)
        .gte('created_at', thirtyDaysAgo.toISOString())
      
      if (error) throw error
      
      const usageCount = (similarEntries?.length || 0) + 1
      setFoodUsageCount(prev => new Map(prev).set(foodDescription, usageCount))
      
      // Auto-create favorite after 3 uses
      if (usageCount === 3) {
        try {
          // Extract first line as name
          const lines = foodDescription.trim().split('\n')
          const name = lines[0].substring(0, 50)
          
          // Determine category based on time
          let category: string = 'anders'
          const hour = parseInt(timeConsumed.split(':')[0])
          if (hour >= 5 && hour < 11) category = 'ontbijt'
          else if (hour >= 11 && hour < 14) category = 'lunch'
          else if (hour >= 17 && hour < 21) category = 'diner'
          else if (hour >= 14 && hour < 17 || hour >= 21 && hour < 23) category = 'snack'
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          
          // Create favorite
          await supabase
            .from('favorite_foods')
            .insert({
              user_id: user.id,
              name,
              description: foodDescription,
              category: category as 'ontbijt' | 'lunch' | 'diner' | 'snack' | 'drank' | 'anders' | null,
              default_time: timeConsumed,
              usage_count: usageCount
            })
            
          console.log(`Auto-created favorite for "${name}" after ${usageCount} uses`)
        } catch (err: any) {
          // Check if table doesn't exist
          if (err?.code === '42P01' || err?.message?.includes('relation "favorite_foods" does not exist')) {
            console.warn('Favorite foods table does not exist yet. Cannot auto-create favorites.')
            return
          }
          // Ignore duplicate errors and other issues
          console.log('Could not auto-create favorite:', err)
        }
      }
    } catch (err) {
      console.error('Error tracking food usage:', err)
    }
  }

  // Load entries when dailyEntryId changes
  useEffect(() => {
    loadEntries()
  }, [dailyEntryId])

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries: loadEntries
  }
}