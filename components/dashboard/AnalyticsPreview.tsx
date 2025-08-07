'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useDailyEntry } from '@/hooks/useDailyEntry'

export function AnalyticsPreview() {
  const { user } = useAuth()
  const { getAnalytics } = useDailyEntry()
  const [stats, setStats] = useState<{
    averageMood: number
    averageEnergy: number
    currentStreak: number
    moodTrend: 'improving' | 'declining' | 'stable'
    energyTrend: 'improving' | 'declining' | 'stable'
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPreviewStats() {
      if (!user) return

      try {
        const data = await getAnalytics(7) // Last 7 days
        if (data) {
          setStats({
            averageMood: data.averageMood,
            averageEnergy: data.averageEnergy,
            currentStreak: data.currentStreak,
            moodTrend: data.moodTrend,
            energyTrend: data.energyTrend,
          })
        }
      } catch (error) {
        console.error('Error fetching analytics preview:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreviewStats()
  }, [user, getAnalytics])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600'
      case 'declining': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Analytics Preview</CardTitle>
          <CardDescription>Je voortgang deze week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Analytics Preview</CardTitle>
          <CardDescription>Je voortgang deze week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Nog geen data beschikbaar</p>
            <p className="text-sm">Begin met het bijhouden van je Life of Ki entries</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Deze Week</CardTitle>
        <CardDescription>Je voortgang van de afgelopen 7 dagen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Streak */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Huidige Streak</p>
              <p className="text-2xl font-bold text-primary">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">
                {stats.currentStreak === 1 ? 'dag' : 'dagen'}
              </p>
            </div>
            <Badge variant={stats.currentStreak >= 7 ? 'default' : 'outline'}>
              {stats.currentStreak >= 7 ? 'Super!' : 'Keep Going'}
            </Badge>
          </div>

          <hr />

          {/* Mood & Energy Trends */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Stemming</span>
                {getTrendIcon(stats.moodTrend)}
              </div>
              <div className="text-right">
                <span className="font-medium">{stats.averageMood.toFixed(1)}/5</span>
                <p className={`text-xs ${getTrendColor(stats.moodTrend)}`}>
                  {stats.moodTrend === 'improving' ? 'Verbeterend' : 
                   stats.moodTrend === 'declining' ? 'Dalend' : 'Stabiel'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Energie</span>
                {getTrendIcon(stats.energyTrend)}
              </div>
              <div className="text-right">
                <span className="font-medium">{stats.averageEnergy.toFixed(1)}/5</span>
                <p className={`text-xs ${getTrendColor(stats.energyTrend)}`}>
                  {stats.energyTrend === 'improving' ? 'Verbeterend' : 
                   stats.energyTrend === 'declining' ? 'Dalend' : 'Stabiel'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}