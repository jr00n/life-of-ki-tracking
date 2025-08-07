'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { WeeklyReflectionForm } from '@/components/forms/WeeklyReflectionForm'
import { useWeeklyReflection } from '@/hooks/useWeeklyReflection'
import type { WeeklyReflectionFormData } from '@/lib/validations/weekly-reflection'

export function WeeklyReflectionPage() {
  // const router = useRouter() // Unused for now
  const {
    isLoading,
    getWeekDates,
    getCurrentWeekReflection,
    saveReflection,
  } = useWeeklyReflection()

  const [existingReflection, setExistingReflection] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [weekDates, setWeekDates] = useState({ weekStart: '', weekEnd: '' })

  useEffect(() => {
    const loadCurrentWeekReflection = async () => {
      const dates = getWeekDates()
      setWeekDates(dates)
      
      const reflection = await getCurrentWeekReflection()
      setExistingReflection(reflection)
    }

    loadCurrentWeekReflection()
  }, [getCurrentWeekReflection, getWeekDates])

  const handleSubmit = async (data: WeeklyReflectionFormData) => {
    const result = await saveReflection(data)
    return result
  }

  if (isLoading && !weekDates.weekStart) {
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
            <div>
              <CardTitle>Wekelijkse Reflectie</CardTitle>
              <CardDescription>
                Reflecteer op je week en stel doelen voor de volgende week
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <WeeklyReflectionForm
        weekStart={weekDates.weekStart}
        weekEnd={weekDates.weekEnd}
        existingReflection={existingReflection}
        onSubmit={handleSubmit}
      />
    </div>
  )
}