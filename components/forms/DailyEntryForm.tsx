'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useDailyEntry } from '@/hooks/useDailyEntry'
import { useRouter } from 'next/navigation'

import { 
  dailyEntrySchema, 
  defaultDailyEntryValues,
  type DailyEntryFormData 
} from '@/lib/validations/daily-entry'

import { BasicInfoStep } from './steps/BasicInfoStep'
import { SleepWellnessStep } from './steps/SleepWellnessStep'
import { ActivitiesStep } from './steps/ActivitiesStep'
import { NutritionStep } from './steps/NutritionStep'

interface DailyEntryFormProps {
  isSubmitting: boolean
  onSubmittingChange: (isSubmitting: boolean) => void
  selectedDate?: string | null
}

const FORM_STEPS = [
  {
    id: 'basic',
    title: 'Basis Informatie',
    description: 'Je stemming en intentie voor vandaag',
  },
  {
    id: 'sleep',
    title: 'Slaap & Welzijn',
    description: 'Hoe heb je geslapen en je welzijn',
  },
  {
    id: 'activities',
    title: 'Activiteiten',
    description: 'Sport, meditatie en buitentijd',
  },
  {
    id: 'nutrition',
    title: 'Voeding',
    description: 'Maaltijden en water inname',
  },
] as const

export function DailyEntryForm({ isSubmitting, onSubmittingChange, selectedDate }: DailyEntryFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [readyToSubmit, setReadyToSubmit] = useState(false)
  const [dailyEntryId, setDailyEntryId] = useState<string | null>(null)
  const { toast } = useToast()
  const { getEntryForDate, saveEntry } = useDailyEntry()
  const router = useRouter()

  const form = useForm<DailyEntryFormData>({
    resolver: zodResolver(dailyEntrySchema),
    defaultValues: defaultDailyEntryValues,
    mode: 'onChange',
  })

  // Load existing entry if it exists
  useEffect(() => {
    async function loadExistingEntry() {
      setIsLoading(true)
      try {
        const existingEntry = await getEntryForDate(selectedDate || undefined)
        if (existingEntry) {
          // Store the daily entry ID for nutrition entries
          setDailyEntryId(existingEntry.id)
          // Map database fields to form fields
          form.reset({
            mood: existingEntry.mood || 3,
            energy_level: existingEntry.energy_level || 3,
            daily_intention: existingEntry.daily_intention || '',
            sleep_hours: existingEntry.sleep_hours || 8,
            sleep_quality: existingEntry.sleep_quality || 3,
            wake_up_time: existingEntry.wake_up_time || '',
            bedtime: existingEntry.bedtime || '',
            exercise_minutes: existingEntry.exercise_minutes || 0,
            exercise_type: existingEntry.exercise_type || '',
            meditation_minutes: existingEntry.meditation_minutes || 0,
            meditation_type: existingEntry.meditation_type || '',
            outdoor_time: existingEntry.outdoor_time || 0,
            water_glasses: existingEntry.water_glasses || 8,
            gratitude: existingEntry.gratitude || '',
            day_highlight: existingEntry.day_highlight || '',
            challenges_faced: existingEntry.challenges_faced || '',
            tomorrow_focus: existingEntry.tomorrow_focus || '',
            stress_level: existingEntry.stress_level || 3,
            notes: existingEntry.notes || '',
          })
        }
      } catch (error) {
        console.error('Error loading existing entry:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingEntry()
  }, [getEntryForDate, selectedDate, form])

  const onSubmit = async (data: DailyEntryFormData) => {
    console.log('⚠️ FORM SUBMITTED! DailyEntryForm onSubmit called with:', data)
    console.log('Current step when submitting:', currentStep)
    console.log('Stack trace:', new Error().stack)
    
    // Only allow submission on the final step
    if (currentStep !== FORM_STEPS.length - 1) {
      console.log('❌ Form submitted but not on final step, ignoring')
      return
    }
    
    onSubmittingChange(true)
    try {
      console.log('DailyEntryForm calling saveEntry...')
      const result = await saveEntry(data, selectedDate || undefined)
      console.log('DailyEntryForm saveEntry result:', result)
      if (result.success) {
        // Store the entry ID for use with nutrition entries
        if (result.entryId) {
          setDailyEntryId(result.entryId)
        }
        toast({
          title: 'Entry Opgeslagen!',
          description: 'Je dagelijkse entry is succesvol opgeslagen.',
        })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      onSubmittingChange(false)
    }
  }

  const nextStep = async () => {
    console.log('🔵 nextStep called, currentStep:', currentStep)
    if (currentStep < FORM_STEPS.length - 1) {
      // Validate current step before proceeding
      let fieldsToValidate: (keyof DailyEntryFormData)[] = []
      
      switch (currentStep) {
        case 0: // Basic Info
          fieldsToValidate = ['mood', 'energy_level', 'daily_intention']
          break
        case 1: // Sleep & Wellness
          fieldsToValidate = ['sleep_quality', 'wake_up_time', 'bedtime', 'stress_level']
          break
        case 2: // Activities
          fieldsToValidate = ['exercise_minutes', 'meditation_minutes', 'outdoor_time']
          break
        case 3: // Nutrition
          fieldsToValidate = ['water_glasses']
          break
      }
      
      // Trigger validation for current step fields
      const isStepValid = await form.trigger(fieldsToValidate)
      
      if (isStepValid) {
        console.log('✅ Step valid, moving to step:', currentStep + 1)
        
        // Save entry when moving to nutrition step (step 3) so we have an ID for nutrition entries
        if (currentStep === 2) {
          const formData = form.getValues()
          const result = await saveEntry(formData, selectedDate || undefined)
          if (result.success && result.entryId) {
            setDailyEntryId(result.entryId)
          }
        }
        
        setCurrentStep(currentStep + 1)
      } else {
        // Show validation errors
        const errors = form.formState.errors
        const stepErrorMessages = fieldsToValidate
          .filter(field => errors[field])
          .map(field => errors[field]?.message)
          .filter(Boolean)
        
        if (stepErrorMessages.length > 0) {
          toast({
            title: 'Vul alle vereiste velden in',
            description: stepErrorMessages.join(', '),
            variant: 'destructive',
          })
        }
      }
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progressPercentage = ((currentStep + 1) / FORM_STEPS.length) * 100

  // Debug: Track step changes
  useEffect(() => {
    console.log('📍 Step changed to:', currentStep)
    if (currentStep === FORM_STEPS.length - 1) {
      console.log('🎯 Reached final step - form should only submit via button click')
    }
  }, [currentStep])

  const renderCurrentStep = () => {
    console.log('🎨 Rendering step:', currentStep, 'of', FORM_STEPS.length - 1)
    switch (currentStep) {
      case 0:
        return <BasicInfoStep form={form} />
      case 1:
        return <SleepWellnessStep form={form} />
      case 2:
        return <ActivitiesStep form={form} />
      case 3:
        return <NutritionStep form={form} dailyEntryId={dailyEntryId} />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('Form onSubmit event triggered', e)
          
          // Prevent form submission unless we're on the final step
          if (currentStep !== FORM_STEPS.length - 1) {
            console.log('❌ Preventing form submission - not on final step')
            e.preventDefault()
            return
          }
          
          return form.handleSubmit(onSubmit)(e)
        }}
        onKeyDown={(e) => {
          // Prevent Enter key from submitting form unless on final step
          if (e.key === 'Enter' && currentStep !== FORM_STEPS.length - 1) {
            console.log('❌ Preventing Enter key submission - not on final step')
            e.preventDefault()
          }
        }}
        className="space-y-6"
      >
        {/* Progress Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Stap {currentStep + 1} van {FORM_STEPS.length}
              </span>
              <span className="text-sm font-medium">
                {Math.round(progressPercentage)}% compleet
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-4" />
            <CardTitle>{FORM_STEPS[currentStep].title}</CardTitle>
            <CardDescription>
              {FORM_STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Current Step Content */}
        <Card>
          <CardContent className="pt-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Vorige
              </Button>

              {currentStep === FORM_STEPS.length - 1 ? (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="gap-2"
                  onClick={async () => {
                    console.log('Submit button clicked!')
                    console.log('Form errors:', form.formState.errors)
                    console.log('Form values:', form.getValues())
                    console.log('Is form valid:', form.formState.isValid)
                    
                    // Show validation errors to user if form is not valid
                    if (!form.formState.isValid) {
                      const errorMessages = Object.entries(form.formState.errors)
                        .map(([field, error]) => `${field}: ${error?.message}`)
                        .join('\n')
                      
                      toast({
                        title: 'Formulier incomplete',
                        description: `Vul eerst alle vereiste velden in:\n${errorMessages}`,
                        variant: 'destructive',
                      })
                      return
                    }

                    // Manually trigger form submission
                    console.log('🚀 Manually triggering form submission')
                    const formData = form.getValues()
                    await onSubmit(formData)
                  }}
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? 'Opslaan...' : 'Entry Opslaan'}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="gap-2"
                >
                  Volgende
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}