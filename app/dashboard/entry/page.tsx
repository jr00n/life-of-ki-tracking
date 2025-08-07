'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { DailyEntryForm } from '@/components/forms/DailyEntryForm'
import { useSearchParams } from 'next/navigation'

export default function DailyEntryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      setSelectedDate(dateParam)
    }
  }, [searchParams])

  // Use selected date from URL parameter or today's date
  const displayDate = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date()
  const isToday = selectedDate ? selectedDate === new Date().toISOString().split('T')[0] : true
  
  const dateDisplay = displayDate.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Terug naar Dashboard
          </Button>
        </Link>
      </div>

      {/* Title Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isToday ? 'Dagelijkse Entry' : 'Entry Bewerken'}
          </CardTitle>
          <CardDescription>
            {dateDisplay} • Deel je Life of Ki ervaring van {isToday ? 'vandaag' : 'deze dag'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isToday 
              ? 'Neem even de tijd om je dag te reflecteren. Deze informatie helpt je inzicht te krijgen in je patronen en voortgang op je persoonlijke reis.'
              : 'Bewerk je entry voor deze datum. Je kunt alle velden aanpassen en de wijzigingen opslaan.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Entry Form */}
      <DailyEntryForm 
        isSubmitting={isSubmitting}
        onSubmittingChange={setIsSubmitting}
        selectedDate={selectedDate}
      />
    </div>
  )
}

