'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Activity, Heart, Clock, ArrowLeft, Edit3, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface DailyEntry {
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

export default function CalendarPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const supabase = createClient()

  // Get current month's entries
  useEffect(() => {
    async function fetchMonthEntries() {
      if (!user) return

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('daily_entries')
        .select('id, entry_date, mood, energy_level, daily_intention, sleep_hours, exercise_minutes, meditation_minutes, created_at')
        .eq('user_id', user.id)
        .gte('entry_date', startOfMonth.toISOString().split('T')[0])
        .lte('entry_date', endOfMonth.toISOString().split('T')[0])
        .order('entry_date', { ascending: true })

      if (error) {
        console.error('Error fetching calendar entries:', error)
      } else {
        setEntries(data || [])
      }
      
      setLoading(false)
    }

    fetchMonthEntries()
  }, [user, currentDate, supabase])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ type: 'empty', id: `empty-${i}` })
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ type: 'day', day, id: `day-${day}` })
    }
    
    return days
  }

  const getEntryForDate = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return entries.find(entry => entry.entry_date === dateString)
  }

  const selectedEntry = selectedDate ? entries.find(e => e.entry_date === selectedDate) : null

  const monthNames = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december'
  ]

  const dayNames = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

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
            <Calendar className="h-8 w-8" />
            Kalender Weergave
          </h1>
          <p className="text-muted-foreground">
            Overzicht van je Life of Ki invoeren per datum
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({length: 42}).map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth().map((dayData) => {
                      if (dayData.type === 'empty') {
                        return <div key={dayData.id} className="h-16"></div>
                      }
                      
                      const day = dayData.day
                      const entry = getEntryForDate(day)
                      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const isSelected = selectedDate === dateString
                      const today = new Date()
                      const isToday = today.getFullYear() === currentDate.getFullYear() && 
                                     today.getMonth() === currentDate.getMonth() && 
                                     today.getDate() === day
                      
                      return (
                        <button
                          key={dayData.id}
                          onClick={() => setSelectedDate(dateString)}
                          className={`
                            h-16 p-2 rounded-lg border transition-colors text-left
                            ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}
                            ${isToday ? 'ring-2 ring-primary/50' : ''}
                          `}
                        >
                          <div className="text-sm font-medium">{day}</div>
                          {entry && (
                            <div className="flex gap-1 mt-1">
                              <div className={`w-2 h-2 rounded-full ${
                                entry.mood >= 4 ? 'bg-green-500' : 
                                entry.mood >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <div className={`w-2 h-2 rounded-full ${
                                entry.energy_level >= 4 ? 'bg-blue-500' : 
                                entry.energy_level >= 3 ? 'bg-orange-500' : 'bg-gray-500'
                              }`}></div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Entry Detail Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? 
                  new Date(selectedDate + 'T12:00:00').toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  }) :
                  'Selecteer een datum'
                }
              </CardTitle>
              <CardDescription>
                {selectedEntry ? 'Entry details' : 'Klik op een datum om details te zien'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEntry ? (
                <div className="space-y-4">
                  {/* Mood & Energy */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Stemming</p>
                        <p className="font-medium">{selectedEntry.mood}/5</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Energie</p>
                        <p className="font-medium">{selectedEntry.energy_level}/5</p>
                      </div>
                    </div>
                  </div>

                  {/* Daily Intention */}
                  {selectedEntry.daily_intention && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dagelijkse Intentie</p>
                      <p className="font-medium text-sm">{selectedEntry.daily_intention}</p>
                    </div>
                  )}

                  {/* Activities */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Activiteiten</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedEntry.sleep_hours}u slaap
                      </Badge>
                      {selectedEntry.exercise_minutes > 0 && (
                        <Badge variant="outline">
                          {selectedEntry.exercise_minutes}min sport
                        </Badge>
                      )}
                      {selectedEntry.meditation_minutes > 0 && (
                        <Badge variant="outline">
                          {selectedEntry.meditation_minutes}min meditatie
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Entry Time */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Opgeslagen: {new Date(selectedEntry.created_at).toLocaleString('nl-NL')}
                    </p>
                  </div>

                  {/* Edit Entry Button */}
                  <div className="pt-4">
                    <Link href={`/dashboard/entry?date=${selectedDate}`}>
                      <Button className="w-full gap-2">
                        <Edit3 className="h-4 w-4" />
                        Entry Bewerken
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8 text-muted-foreground space-y-4">
                  <Calendar className="h-12 w-12 mx-auto opacity-50" />
                  <p>Geen entry voor deze datum</p>
                  <Link href={`/dashboard/entry?date=${selectedDate}`}>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Entry Toevoegen
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecteer een datum om te beginnen</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Goede stemming (4-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Neutrale stemming (3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Lage stemming (1-2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Hoge energie (4-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Gemiddelde energie (3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span>Lage energie (1-2)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}