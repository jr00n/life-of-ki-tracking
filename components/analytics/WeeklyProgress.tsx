'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface WeeklyProgressData {
  week: string
  mood: number
  energy: number
  sleep: number
  exercise: number
  meditation: number
  entries: number
  totalDays: number
}

interface WeeklyProgressProps {
  data: WeeklyProgressData[]
}

export function WeeklyProgress({ data }: WeeklyProgressProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wekelijkse Voortgang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Geen wekelijkse data beschikbaar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getProgressColor = (value: number, max: number = 5) => {
    const percentage = (value / max) * 100
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getCompletionColor = (entries: number, totalDays: number) => {
    const percentage = (entries / totalDays) * 100
    if (percentage === 100) return 'bg-green-500'
    if (percentage >= 80) return 'bg-green-400'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wekelijkse Voortgang</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((week, index) => {
            const completionRate = (week.entries / week.totalDays) * 100
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{week.week}</h4>
                  <Badge variant={completionRate === 100 ? 'default' : 'outline'}>
                    {week.entries}/{week.totalDays} dagen
                  </Badge>
                </div>

                <div className="space-y-2">
                  {/* Completion Rate */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Volledigheid</span>
                    <span className="font-medium">{Math.round(completionRate)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getCompletionColor(week.entries, week.totalDays)}`}
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>

                  {/* Mood */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stemming</span>
                    <span className="font-medium">{week.mood.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(week.mood)}`}
                      style={{ width: `${(week.mood / 5) * 100}%` }}
                    ></div>
                  </div>

                  {/* Energy */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Energie</span>
                    <span className="font-medium">{week.energy.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(week.energy)}`}
                      style={{ width: `${(week.energy / 5) * 100}%` }}
                    ></div>
                  </div>

                  {/* Sleep */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Slaap</span>
                    <span className="font-medium">{week.sleep.toFixed(1)}u</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(week.sleep, 10)}`}
                      style={{ width: `${Math.min((week.sleep / 8) * 100, 100)}%` }}
                    ></div>
                  </div>

                  {/* Exercise & Meditation */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{week.exercise}</p>
                      <p className="text-xs text-muted-foreground">min sport</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{week.meditation}</p>
                      <p className="text-xs text-muted-foreground">min meditatie</p>
                    </div>
                  </div>
                </div>

                {index < data.length - 1 && <hr className="my-4" />}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}