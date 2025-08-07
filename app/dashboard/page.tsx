'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Calendar, TrendingUp, Heart, Activity, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { TodayOverview } from '@/components/dashboard/TodayOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { AnalyticsPreview } from '@/components/dashboard/AnalyticsPreview'
import { createClient } from '@/lib/supabase/client'

interface RecentEntry {
  id: string
  entry_date: string
  mood: number
  energy_level: number
  daily_intention: string
  sleep_hours: number
  exercise_minutes: number
  meditation_minutes: number
  created_at: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const supabase = createClient()
  
  const today = new Date().toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  useEffect(() => {
    async function fetchRecentEntries() {
      if (!user) return

      const { data, error } = await supabase
        .from('daily_entries')
        .select('id, entry_date, mood, energy_level, daily_intention, sleep_hours, exercise_minutes, meditation_minutes, created_at')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching recent entries:', error)
      } else {
        setRecentEntries(data || [])
      }
      
      setLoadingRecent(false)
    }

    fetchRecentEntries()
  }, [user, supabase])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welkom terug, {user?.user_metadata?.name || 'daar'}!
        </h1>
        <p className="text-muted-foreground">
          {today} • Klaar om je Life of Ki reis bij te houden?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Dagelijkse Invoer
            </CardTitle>
            <CardDescription>
              Registreer vandaag je humeur, activiteiten en Life of Ki data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/entry">
              <Button className="w-full">
                Voeg vandaag toe
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Kalender Weergave
            </CardTitle>
            <CardDescription>
              Bekijk je invoeren per datum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="w-full">
                Bekijk Kalender
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              Analyse
            </CardTitle>
            <CardDescription>
              Bekijk je voortgang en inzichten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full">
                Bekijk Analyse
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodayOverview />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <AnalyticsPreview />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recente Activiteit</CardTitle>
          <CardDescription>
            Je laatste Life of Ki invoeren
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded flex-1"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Begin met bijhouden om je activiteit hier te zien</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{entry.mood}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">{entry.energy_level}/5</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">
                        {entry.daily_intention || 'Geen intentie opgegeven'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {entry.sleep_hours}u slaap
                        </span>
                        <span>{entry.exercise_minutes}min sport</span>
                        <span>{entry.meditation_minutes}min meditatie</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(entry.entry_date).toLocaleDateString('nl-NL', {
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleTimeString('nl-NL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}