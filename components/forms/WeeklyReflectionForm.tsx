'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, MessageSquare, Target, Heart, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

import { 
  weeklyReflectionSchema, 
  defaultWeeklyReflectionValues,
  type WeeklyReflectionFormData 
} from '@/lib/validations/weekly-reflection'

interface WeeklyReflectionFormProps {
  weekStart: string
  weekEnd: string
  existingReflection?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  onSubmit: (data: WeeklyReflectionFormData) => Promise<{ success: boolean }>
}

export function WeeklyReflectionForm({ 
  weekStart, 
  weekEnd, 
  existingReflection, 
  onSubmit 
}: WeeklyReflectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<WeeklyReflectionFormData>({
    resolver: zodResolver(weeklyReflectionSchema),
    defaultValues: defaultWeeklyReflectionValues,
    mode: 'onChange',
  })

  // Load existing reflection if available
  useEffect(() => {
    if (existingReflection) {
      form.reset({
        personal_insight: existingReflection.personal_insight || '',
        movement_goal_achieved: existingReflection.movement_goal_achieved,
        movement_goal_next_week: existingReflection.movement_goal_next_week || '',
        nutrition_goal_achieved: existingReflection.nutrition_goal_achieved,
        nutrition_goal_next_week: existingReflection.nutrition_goal_next_week || '',
        favorite_relaxation: existingReflection.favorite_relaxation || '',
        relaxation_goal_next_week: existingReflection.relaxation_goal_next_week || '',
        overall_energy_reflection: existingReflection.overall_energy_reflection || '',
      })
    }
  }, [existingReflection, form])

  const handleSubmit = async (data: WeeklyReflectionFormData) => {
    setIsSubmitting(true)
    try {
      const result = await onSubmit(data)
      if (result.success) {
        toast({
          title: 'Wekelijkse Reflectie Opgeslagen!',
          description: 'Je wekelijkse reflectie is succesvol opgeslagen.',
        })
        router.push('/dashboard/reflections')
      }
    } catch (error) {
      console.error('Error submitting weekly reflection:', error)
      toast({
        title: 'Fout bij opslaan',
        description: 'Er is een fout opgetreden bij het opslaan van je reflectie.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Wekelijkse Reflectie
            </CardTitle>
            <CardDescription>
              Week van {formatDateRange(weekStart, weekEnd)}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Personal Insight */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Persoonlijk Inzicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="personal_insight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wat is je belangrijkste inzicht van deze week?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Beschrijf wat je hebt geleerd over jezelf, je gewoontes, of je welzijn..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Movement Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Bewegingsdoelen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="movement_goal_achieved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heb je je bewegingsdoel van deze week behaald?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value === undefined ? undefined : field.value ? 'true' : 'false'}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="movement-yes" />
                        <Label htmlFor="movement-yes">Ja</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="movement-no" />
                        <Label htmlFor="movement-no">Nee</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="movement_goal_next_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wat is je bewegingsdoel voor volgende week?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Bijvoorbeeld: 3x per week 30 minuten wandelen, yoga op maandag en woensdag..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Voedingsdoelen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="nutrition_goal_achieved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heb je je voedingsdoel van deze week behaald?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value === undefined ? undefined : field.value ? 'true' : 'false'}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="nutrition-yes" />
                        <Label htmlFor="nutrition-yes">Ja</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="nutrition-no" />
                        <Label htmlFor="nutrition-no">Nee</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nutrition_goal_next_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wat is je voedingsdoel voor volgende week?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Bijvoorbeeld: elke dag 5 porties groenten en fruit, minder suiker..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Relaxation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Ontspanning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="favorite_relaxation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wat was je favoriete ontspanning deze week?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Bijvoorbeeld: lezen in de tuin, meditatie, muziek luisteren..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relaxation_goal_next_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wat is je ontspanningsdoel voor volgende week?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Bijvoorbeeld: elke avond 15 minuten meditatie, weekend in de natuur..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Overall Energy Reflection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Algehele Energie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="overall_energy_reflection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoe zou je je algehele energieniveau van deze week beschrijven?</FormLabel>
                  <FormDescription>
                    Denk aan je fysieke energie, mentale helderheid, emotionele balans...
                  </FormDescription>
                  <FormControl>
                    <Textarea 
                      placeholder="Beschrijf hoe je je energieniveau hebt ervaren, wat invloed had op je energie, en hoe je je voelde..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="w-full gap-2"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Opslaan...' : 'Reflectie Opslaan'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}