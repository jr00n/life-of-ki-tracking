'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Heart, Target, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface TodayEntry {
  id: string
  mood: number
  energy_level: number
  sleep_hours: number
  sleep_quality: number
  exercise_minutes: number
  meditation_minutes: number
  daily_intention: string
  gratitude: string
  water_glasses: number
  created_at: string
}

export function TodayOverview() {
  const { user } = useAuth()
  const [todayEntry, setTodayEntry] = useState<TodayEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTodayEntry() {
      if (!user) return

      const today = new Date().toISOString().split('T')[0]
      
      console.log('Fetching today entry for user:', user.id, 'date:', today)
      
      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .single()

      console.log('Dashboard query result:', { data, error })

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today entry:', error)
      } else {
        console.log('Setting today entry:', data)
        setTodayEntry(data)
      }
      
      setLoading(false)
    }

    fetchTodayEntry()
  }, [user, supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vandaag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!todayEntry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Vandaag
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('nl-NL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nog geen entry voor vandaag</p>
            <p className="text-sm">Start je dag door je intentie en stemming vast te leggen</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Vandaag
        </CardTitle>
        <CardDescription>
          {new Date(todayEntry.created_at).toLocaleDateString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood and Energy */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stemming</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= todayEntry.mood
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Energie</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= todayEntry.energy_level
                        ? 'bg-orange-600'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Intention */}
        {todayEntry.daily_intention && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Dagelijkse intentie</p>
            <p className="text-sm leading-relaxed">{todayEntry.daily_intention}</p>
          </div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>{todayEntry.sleep_hours}u slaap</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            <span>{todayEntry.exercise_minutes}min sport</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple-600" />
            <span>{todayEntry.meditation_minutes}min meditatie</span>
          </div>
          
        </div>

        {/* Gratitude */}
        {todayEntry.gratitude && (
          <div className="bg-primary/5 rounded-lg p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Dankbaarheid</p>
            <p className="text-sm leading-relaxed italic">"{todayEntry.gratitude}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}