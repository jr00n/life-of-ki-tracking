'use client'

import { UseFormReturn } from 'react-hook-form'
import { Activity, Heart, Sun } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import type { DailyEntryFormData } from '@/lib/validations/daily-entry'

interface ActivitiesStepProps {
  form: UseFormReturn<DailyEntryFormData>
}

const EXERCISE_TYPES = [
  'Wandelen',
  'Hardlopen', 
  'Fietsen',
  'Zwemmen',
  'Fitness/Krachttraining',
  'Yoga',
  'Pilates',
  'Dansen',
  'Teamsport',
  'Anders'
]

const MEDITATION_TYPES = [
  'Ademhalingsmeditatie',
  'Mindfulness',
  'Geleide meditatie',
  'Lichaamsscan',
  'Mantra meditatie',
  'Wandelmeditatie',
  'Visualisatie',
  'Anders'
]


export function ActivitiesStep({ form }: ActivitiesStepProps) {
  return (
    <div className="space-y-8">
      {/* Exercise Section */}
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Sport & Beweging</h3>
            </div>

            <FormField
              control={form.control}
              name="exercise_minutes"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Hoeveel minuten heb je gesport?</FormLabel>
                  <FormDescription>
                    Inclusief alle vormen van lichaamsbeweging
                  </FormDescription>
                  <div className="space-y-4">
                    <FormControl>
                      <Slider
                        min={0}
                        max={180}
                        step={5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-green-600">
                        {field.value}
                      </span>
                      <span className="text-lg text-muted-foreground ml-2">minuten</span>
                      <div className="mt-2">
                        {field.value >= 30 && (
                          <p className="text-sm text-green-600">
                            Geweldig! Je hebt het dagelijkse doel bereikt
                          </p>
                        )}
                        {field.value > 0 && field.value < 30 && (
                          <p className="text-sm text-amber-600">
                            Elke beweging telt!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exercise_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type sport/beweging (optioneel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kies je activiteit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXERCISE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Meditation Section */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Meditatie & Mindfulness</h3>
            </div>

            <FormField
              control={form.control}
              name="meditation_minutes"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Hoeveel minuten heb je gemediteerd?</FormLabel>
                  <FormDescription>
                    Inclusief mindfulness oefeningen en ademwerk
                  </FormDescription>
                  <div className="space-y-4">
                    <FormControl>
                      <Slider
                        min={0}
                        max={120}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-purple-600">
                        {field.value}
                      </span>
                      <span className="text-lg text-muted-foreground ml-2">minuten</span>
                      <div className="mt-2">
                        {field.value >= 10 && (
                          <p className="text-sm text-purple-600">
                            Mooi! Dagelijkse meditatie is zeer waardevol
                          </p>
                        )}
                        {field.value > 0 && field.value < 10 && (
                          <p className="text-sm text-amber-600">
                            Elke minuut mindfulness helpt
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meditation_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type meditatie (optioneel)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kies je meditatie type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEDITATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Outdoor Time Section */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="outdoor_time"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Sun className="h-5 w-5 text-yellow-600" />
                  </div>
                  Tijd buiten doorgebracht
                </FormLabel>
                <FormDescription>
                  Hoeveel minuten ben je buiten geweest? (wandelen, tuin, balkon, etc.)
                </FormDescription>
                <div className="space-y-4">
                  <FormControl>
                    <Slider
                      min={0}
                      max={480}
                      step={15}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-yellow-600">
                      {field.value}
                    </span>
                    <span className="text-lg text-muted-foreground ml-2">minuten</span>
                    <div className="mt-2">
                      {field.value >= 60 && (
                        <p className="text-sm text-yellow-600">
                          Fantastisch! Natuurlijk licht is belangrijk
                        </p>
                      )}
                      {field.value >= 30 && field.value < 60 && (
                        <p className="text-sm text-green-600">
                          Goed bezig met buitentijd
                        </p>
                      )}
                    </div>
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