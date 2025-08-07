'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Target, Heart, MessageSquare, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

import { useWeeklyReflection } from '@/hooks/useWeeklyReflection'
import type { Database } from '@/types/database.types'

type WeeklySummary = Database['public']['Tables']['weekly_summaries']['Row']

export function WeeklyReflectionsOverview() {
  const {
    isLoading,
    getAllReflections,
    getReflectionStats,
  } = useWeeklyReflection()

  const [reflections, setReflections] = useState<WeeklySummary[]>([])
  const [stats, setStats] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    const loadReflections = async () => {
      const data = await getAllReflections(20) // Load last 20 reflections
      setReflections(data)
      
      const statsData = await getReflectionStats()
      setStats(statsData)
    }

    loadReflections()
  }, [getAllReflections, getReflectionStats])

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    return `${startDate.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'long' 
    })} - ${endDate.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <CardTitle>Wekelijkse Reflecties</CardTitle>
              <CardDescription>
                Overzicht van je wekelijkse reflecties en voortgang
              </CardDescription>
            </div>
            <Link href="/dashboard/reflection">
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Nieuwe Reflectie
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Totaal Reflecties
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReflections}</div>
              <p className="text-xs text-muted-foreground">
                Afgelopen 12 weken
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bewegingsdoelen
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.movementGoalSuccessRate)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Behaald
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Voedingsdoelen
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.nutritionGoalSuccessRate)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Behaald
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reflections List */}
      <div className="space-y-4">
        {reflections.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nog geen reflecties</h3>
                <p className="mb-4">
                  Begin met je eerste wekelijkse reflectie om je voortgang te volgen.
                </p>
                <Link href="/dashboard/reflection">
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Eerste Reflectie Maken
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          reflections.map((reflection) => (
            <Card key={reflection.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {formatDateRange(reflection.week_start, reflection.week_end)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Reflectie ingevuld op{' '}
                      {new Date(reflection.created_at).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={reflection.movement_goal_achieved ? "default" : "secondary"}>
                      <Target className="h-3 w-3 mr-1" />
                      Beweging {reflection.movement_goal_achieved ? "✓" : "✗"}
                    </Badge>
                    <Badge variant={reflection.nutrition_goal_achieved ? "default" : "secondary"}>
                      <Heart className="h-3 w-3 mr-1" />
                      Voeding {reflection.nutrition_goal_achieved ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Insight */}
                {reflection.personal_insight && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4" />
                      Persoonlijk Inzicht
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {reflection.personal_insight}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Goals Overview */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      Bewegingsdoel
                    </h4>
                    {reflection.movement_goal_next_week && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Volgende week:</strong> {reflection.movement_goal_next_week}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4" />
                      Voedingsdoel
                    </h4>
                    {reflection.nutrition_goal_next_week && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Volgende week:</strong> {reflection.nutrition_goal_next_week}
                      </p>
                    )}
                  </div>
                </div>

                {/* Relaxation & Energy */}
                {(reflection.favorite_relaxation || reflection.overall_energy_reflection) && (
                  <>
                    <Separator />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      {reflection.favorite_relaxation && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4" />
                            Favoriete Ontspanning
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {reflection.favorite_relaxation}
                          </p>
                          {reflection.relaxation_goal_next_week && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Volgende week:</strong> {reflection.relaxation_goal_next_week}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {reflection.overall_energy_reflection && (
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4" />
                            Energie Reflectie
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {reflection.overall_energy_reflection}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}