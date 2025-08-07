'use client'

import { UseFormReturn } from 'react-hook-form'
import { Moon, Clock, AlertTriangle } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import type { DailyEntryFormData } from '@/lib/validations/daily-entry'

interface SleepWellnessStepProps {
  form: UseFormReturn<DailyEntryFormData>
}

const SLEEP_QUALITY_LABELS = [
  'Zeer slecht',
  'Slecht',
  'Redelijk',
  'Goed',
  'Uitstekend'
]

const STRESS_LABELS = [
  'Zeer laag',
  'Laag',
  'Gemiddeld',
  'Hoog',
  'Zeer hoog'
]

export function SleepWellnessStep({ form }: SleepWellnessStepProps) {
  // Calculate sleep hours based on bedtime and wake time
  const calculateSleepHours = (bedtime: string, wakeTime: string) => {
    if (!bedtime || !wakeTime) return 0
    
    const [bedHour, bedMin] = bedtime.split(':').map(Number)
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number)
    
    const bedDate = new Date()
    bedDate.setHours(bedHour, bedMin, 0, 0)
    
    const wakeDate = new Date()
    wakeDate.setHours(wakeHour, wakeMin, 0, 0)
    
    // If wake time is before bed time, it's the next day
    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1)
    }
    
    const diffMs = wakeDate.getTime() - bedDate.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    return Math.round(diffHours * 10) / 10 // Round to 1 decimal
  }

  const bedtime = form.watch('bedtime')
  const wakeTime = form.watch('wake_up_time')
  const calculatedSleepHours = calculateSleepHours(bedtime, wakeTime)

  return (
    <div className="space-y-8">
      {/* Sleep Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="bedtime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedtijd <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    Hoe laat ben je naar bed gegaan?
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="wake_up_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opstaan tijd <span className="text-red-500">*</span></FormLabel>
                  <FormDescription>
                    Hoe laat ben je wakker geworden?
                  </FormDescription>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Calculated Sleep Hours Display */}
      {calculatedSleepHours > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg w-fit mx-auto">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Berekende slaaptijd</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatisch berekend op basis van je bed- en opstaan tijd
                </p>
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {calculatedSleepHours}
                  </span>
                  <span className="text-lg text-muted-foreground ml-2">uur</span>
                  <div className="mt-2">
                    {calculatedSleepHours < 6 && (
                      <p className="text-sm text-amber-600 flex items-center justify-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Minder dan aanbevolen (7-9 uur)
                      </p>
                    )}
                    {calculatedSleepHours >= 6 && calculatedSleepHours <= 9 && (
                      <p className="text-sm text-green-600">
                        Binnen gezonde range
                      </p>
                    )}
                    {calculatedSleepHours > 9 && (
                      <p className="text-sm text-amber-600">
                        Meer dan gemiddeld
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sleep Quality Section */}
      <Card className="border-indigo-200 dark:border-indigo-800">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="sleep_quality"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Moon className="h-5 w-5 text-indigo-600" />
                  </div>
                  Hoe was je slaapkwaliteit?
                </FormLabel>
                <FormDescription>
                  Hoe diep en rustgevend was je slaap?
                </FormDescription>
                <div className="space-y-4">
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {SLEEP_QUALITY_LABELS.map((label, index) => (
                      <span 
                        key={index}
                        className={field.value === index + 1 ? 'text-indigo-600 font-medium' : ''}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-indigo-600">
                      {field.value}/5
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {SLEEP_QUALITY_LABELS[field.value - 1]}
                    </p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Stress Level Section */}
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="stress_level"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  Wat is je stressniveau vandaag?
                </FormLabel>
                <FormDescription>
                  Hoe gestrest of gespannen voel je je?
                </FormDescription>
                <div className="space-y-4">
                  <FormControl>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {STRESS_LABELS.map((label, index) => (
                      <span 
                        key={index}
                        className={field.value === index + 1 ? 'text-red-600 font-medium' : ''}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-red-600">
                      {field.value}/5
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {STRESS_LABELS[field.value - 1]}
                    </p>
                    {field.value >= 4 && (
                      <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Overweeg ontspanningstechnieken
                      </p>
                    )}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}