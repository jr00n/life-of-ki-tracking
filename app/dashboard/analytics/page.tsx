'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, ArrowLeft, Activity, Heart, Clock, Target, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { useDailyEntry } from '@/hooks/useDailyEntry'
import { TrendChart } from '@/components/analytics/TrendChart'
import { WeeklyProgress } from '@/components/analytics/WeeklyProgress'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AnalyticsStats {
  totalEntries: number
  averageMood: number
  averageEnergy: number
  averageSleep: number
  totalExercise: number
  totalMeditation: number
  currentStreak: number
  longestStreak: number
  moodTrend: 'improving' | 'declining' | 'stable'
  energyTrend: 'improving' | 'declining' | 'stable'
  sleepTrend: 'improving' | 'declining' | 'stable'
}

interface WeeklyData {
  weekStart: string
  averageMood: number
  averageEnergy: number
  averageSleep: number
  exerciseMinutes: number
  meditationMinutes: number
  entryCount: number
}

type TimeRange = '7' | '30' | '90'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { getAnalytics } = useDailyEntry()
  const supabase = createClient()
  const [timeRange, setTimeRange] = useState<TimeRange>('30')
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [trendData, setTrendData] = useState<{
    mood: Array<{date: string, value: number}>
    energy: Array<{date: string, value: number}>
    sleep: Array<{date: string, value: number}>
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return

      setLoading(true)
      try {
        // Get analytics data with trends and streaks
        const analyticsData = await getAnalytics(parseInt(timeRange))
        if (analyticsData) {
          setStats(analyticsData)
        }

        // Fetch trend data for charts
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - parseInt(timeRange))

        const { data: entries, error } = await supabase
          .from('daily_entries')
          .select('entry_date, mood, energy_level, sleep_hours')
          .eq('user_id', user.id)
          .gte('entry_date', startDate.toISOString().split('T')[0])
          .lte('entry_date', endDate.toISOString().split('T')[0])
          .order('entry_date', { ascending: true })

        if (!error && entries) {
          setTrendData({
            mood: entries.map(e => ({ date: e.entry_date, value: e.mood || 0 })),
            energy: entries.map(e => ({ date: e.entry_date, value: e.energy_level || 0 })),
            sleep: entries.map(e => ({ date: e.entry_date, value: e.sleep_hours || 0 })),
          })
        }

        // TODO: Fetch weekly aggregated data
        setWeeklyData([])
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, timeRange, getAnalytics])

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↗️'
      case 'declining': return '↘️'
      default: return '→'
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics & Inzichten
          </h1>
          <p className="text-muted-foreground">
            Ontdek patronen en voortgang in je Life of Ki reis
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Afgelopen 7 dagen</SelectItem>
            <SelectItem value="30">Afgelopen 30 dagen</SelectItem>
            <SelectItem value="90">Afgelopen 90 dagen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Total Entries */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Totaal Entries</p>
                    <p className="text-3xl font-bold">{stats.totalEntries}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeRange} dagen periode
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Average Mood */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gemiddelde Stemming</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{stats.averageMood.toFixed(1)}</p>
                      <span className={`text-sm ${getTrendColor(stats.moodTrend)}`}>
                        {getTrendIcon(stats.moodTrend)}
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {stats.moodTrend === 'improving' ? 'Verbeterend' : 
                       stats.moodTrend === 'declining' ? 'Dalend' : 'Stabiel'}
                    </Badge>
                  </div>
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Average Energy */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gemiddelde Energie</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{stats.averageEnergy.toFixed(1)}</p>
                      <span className={`text-sm ${getTrendColor(stats.energyTrend)}`}>
                        {getTrendIcon(stats.energyTrend)}
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {stats.energyTrend === 'improving' ? 'Verbeterend' : 
                       stats.energyTrend === 'declining' ? 'Dalend' : 'Stabiel'}
                    </Badge>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            {/* Average Sleep */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gemiddelde Slaap</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold">{stats.averageSleep.toFixed(1)}u</p>
                      <span className={`text-sm ${getTrendColor(stats.sleepTrend)}`}>
                        {getTrendIcon(stats.sleepTrend)}
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {stats.averageSleep >= 7 && stats.averageSleep <= 9 ? 'Optimaal' : 
                       stats.averageSleep < 7 ? 'Te weinig' : 'Te veel'}
                    </Badge>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activiteiten Overzicht</CardTitle>
                <CardDescription>
                  Je sport en meditatie activiteiten in de afgelopen {timeRange} dagen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sport</p>
                        <p className="text-sm text-muted-foreground">
                          Totaal {stats.totalExercise} minuten
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(stats.totalExercise / (parseInt(timeRange) / 7))}
                      </p>
                      <p className="text-xs text-muted-foreground">min/week</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Meditatie</p>
                        <p className="text-sm text-muted-foreground">
                          Totaal {stats.totalMeditation} minuten
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round(stats.totalMeditation / (parseInt(timeRange) / 7))}
                      </p>
                      <p className="text-xs text-muted-foreground">min/week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consistentie & Streaks</CardTitle>
                <CardDescription>
                  Je dagelijkse tracking prestaties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{stats.currentStreak}</p>
                    <p className="text-sm text-muted-foreground">Huidige streak (dagen)</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-muted-foreground">{stats.longestStreak}</p>
                    <p className="text-sm text-muted-foreground">Langste streak ooit</p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Tracking Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all" 
                          style={{ width: `${(stats.totalEntries / parseInt(timeRange)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((stats.totalEntries / parseInt(timeRange)) * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.totalEntries} van {timeRange} dagen bijgehouden
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Charts */}
          {trendData && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Trends Overzicht</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <TrendChart 
                  title="Stemming Trend"
                  data={trendData.mood}
                  color="rgb(236, 72, 153)"
                  maxValue={5}
                />
                <TrendChart 
                  title="Energie Trend"
                  data={trendData.energy}
                  color="rgb(249, 115, 22)"
                  maxValue={5}
                />
                <TrendChart 
                  title="Slaap Trend"
                  data={trendData.sleep}
                  color="rgb(59, 130, 246)"
                  maxValue={12}
                  unit="u"
                />
              </div>
            </div>
          )}

          {/* Insights & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Inzichten & Aanbevelingen</CardTitle>
              <CardDescription>
                Gepersonaliseerde tips gebaseerd op je Life of Ki data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.averageMood < 3 && (
                  <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                          Stemming Aandacht
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Je gemiddelde stemming is lager dan normaal. Overweeg meer tijd voor zelfzorg 
                          en activiteiten die je blij maken.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.averageSleep < 7 && (
                  <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">
                          Slaap Optimalisatie
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Je slaapt gemiddeld {stats.averageSleep.toFixed(1)} uur per nacht. 
                          Probeer naar 7-9 uur slaap per nacht te streven voor optimale prestaties.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.totalExercise / parseInt(timeRange) < 30 && (
                  <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          Beweging Stimulatie
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Je sport gemiddeld {Math.round(stats.totalExercise / parseInt(timeRange))} minuten per dag. 
                          Probeer dagelijks minstens 30 minuten te bewegen voor betere gezondheid.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.currentStreak >= 7 && (
                  <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-primary">
                          Geweldige Streak! 🎉
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Je bent al {stats.currentStreak} dagen consistent bezig met je Life of Ki reis. 
                          Blijf zo doorgaan!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Geen data beschikbaar voor de geselecteerde periode
          </p>
        </div>
      )}
    </div>
  )
}