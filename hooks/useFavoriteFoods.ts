'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { FavoriteFood, FavoriteFoodInsert } from '@/types/database.types'

export function useFavoriteFoods() {
  const [favorites, setFavorites] = useState<FavoriteFood[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  // Load favorite foods
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('favorite_foods')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false })
        .order('name', { ascending: true })

      if (error) {
        // Check if table doesn't exist (404/relation does not exist)
        if (error.code === '42P01' || error.message.includes('relation "favorite_foods" does not exist')) {
          console.warn('Favorite foods table does not exist yet. Skipping favorites.')
          setFavorites([])
          setError(null)
          return
        }
        throw error
      }

      setFavorites(data || [])
      setError(null)
    } catch (err) {
      console.error('Error loading favorite foods:', err)
      setError('Kon favorieten niet laden')
    } finally {
      setLoading(false)
    }
  }

  // Add new favorite food
  const addFavorite = async (name: string, description: string, category?: string, defaultTime?: string) => {
    if (!user) throw new Error('Geen gebruiker ingelogd')

    try {
      const insertData: FavoriteFoodInsert = {
        user_id: user.id,
        name,
        description,
        category: category as any,
        default_time: defaultTime
      }

      const { data, error } = await supabase
        .from('favorite_foods')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      setFavorites(prev => [...prev, data].sort((a, b) => 
        b.usage_count - a.usage_count || a.name.localeCompare(b.name)
      ))

      return data
    } catch (err: any) {
      // Check if table doesn't exist
      if (err?.code === '42P01' || err?.message?.includes('relation "favorite_foods" does not exist')) {
        console.warn('Favorite foods table does not exist yet. Cannot add favorites.')
        throw new Error('Favorieten functie is nog niet beschikbaar')
      }
      // Check for unique constraint violation
      if (err?.code === '23505') {
        throw new Error('Dit voedingsmiddel staat al in je favorieten')
      }
      console.error('Error adding favorite food:', err)
      throw new Error('Kon favoriet niet toevoegen')
    }
  }

  // Create favorite from existing nutrition entry
  const createFromEntry = async (foodDescription: string, timeConsumed?: string) => {
    if (!user) throw new Error('Geen gebruiker ingelogd')

    // Extract first line as name if multi-line
    const lines = foodDescription.trim().split('\n')
    const name = lines[0].substring(0, 50) // Max 50 chars for name
    
    // Determine category based on time
    let category: string | undefined
    if (timeConsumed) {
      const hour = parseInt(timeConsumed.split(':')[0])
      if (hour >= 5 && hour < 11) category = 'ontbijt'
      else if (hour >= 11 && hour < 14) category = 'lunch'
      else if (hour >= 17 && hour < 21) category = 'diner'
      else category = 'snack'
    }

    return addFavorite(name, foodDescription, category, timeConsumed)
  }

  // Update usage count when a favorite is used
  const recordUsage = async (favoriteId: string) => {
    try {
      const favorite = favorites.find(f => f.id === favoriteId)
      if (!favorite) return

      const { error } = await supabase
        .from('favorite_foods')
        .update({
          usage_count: (favorite.usage_count || 0) + 1,
          last_used: new Date().toISOString().split('T')[0]
        })
        .eq('id', favoriteId)

      if (error) throw error

      // Update local state
      setFavorites(prev => prev.map(f => 
        f.id === favoriteId 
          ? { ...f, usage_count: (f.usage_count || 0) + 1, last_used: new Date().toISOString().split('T')[0] }
          : f
      ).sort((a, b) => b.usage_count - a.usage_count || a.name.localeCompare(b.name)))
    } catch (err) {
      console.error('Error recording usage:', err)
    }
  }

  // Delete favorite food
  const deleteFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_foods')
        .delete()
        .eq('id', id)

      if (error) throw error

      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      console.error('Error deleting favorite:', err)
      throw new Error('Kon favoriet niet verwijderen')
    }
  }

  // Load favorites when user changes
  useEffect(() => {
    loadFavorites()
  }, [user])

  return {
    favorites,
    loading,
    error,
    addFavorite,
    createFromEntry,
    recordUsage,
    deleteFavorite,
    refreshFavorites: loadFavorites
  }
}