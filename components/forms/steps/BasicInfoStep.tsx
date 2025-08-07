'use client'

import { UseFormReturn } from 'react-hook-form'
import { Heart, Zap, Target } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import type { DailyEntryFormData } from '@/lib/validations/daily-entry'

interface BasicInfoStepProps {
  form: UseFormReturn<DailyEntryFormData>
}

const MOOD_LABELS = [
  'Zeer slecht',
  'Slecht', 
  'Neutraal',
  'Goed',
  'Uitstekend'
]

const ENERGY_LABELS = [
  'Uitgeput',
  'Moe',
  'Normaal',
  'Energiek',
  'Zeer energiek'
]

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  return (
    <div className="space-y-8">
      {/* Mood Section */}
      <Card className="border-pink-200 dark:border-pink-800">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                    <Heart className="h-5 w-5 text-pink-600" />
                  </div>
                  Hoe voel je je vandaag?
                </FormLabel>
                <FormDescription>
                  Geef je algemene stemming aan op een schaal van 1 tot 5
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
                    {MOOD_LABELS.map((label, index) => (
                      <span 
                        key={index}
                        className={field.value === index + 1 ? 'text-primary font-medium' : ''}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">
                      {field.value}/5
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {MOOD_LABELS[field.value - 1]}
                    </p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Energy Level Section */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="energy_level"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  Hoe is je energieniveau?
                </FormLabel>
                <FormDescription>
                  Hoe energiek voel je je op dit moment?
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
                    {ENERGY_LABELS.map((label, index) => (
                      <span 
                        key={index}
                        className={field.value === index + 1 ? 'text-orange-600 font-medium' : ''}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-orange-600">
                      {field.value}/5
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ENERGY_LABELS[field.value - 1]}
                    </p>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Daily Intention Section */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="daily_intention"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  Wat is je intentie voor vandaag? <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>
                  Schrijf op waar je je vandaag op wilt focussen. Dit kan een gevoel, doel, of houding zijn.
                </FormDescription>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Bijvoorbeeld: 'Vandaag wil ik geduldig en dankbaar zijn' of 'Ik focus op bewuste ademhaling tijdens stressvolle momenten'"
                    className="min-h-[100px] resize-none"
                  />
                </FormControl>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{field.value?.length || 0} / 500 karakters</span>
                  {field.value && field.value.length > 450 && (
                    <span className="text-amber-600">
                      Bijna vol
                    </span>
                  )}
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