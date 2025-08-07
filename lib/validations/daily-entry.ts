import { z } from 'zod'

export const dailyEntrySchema = z.object({
  // Basic Info
  mood: z.number().min(1, 'Kies je stemming').max(5, 'Stemming moet tussen 1 en 5 zijn'),
  energy_level: z.number().min(1, 'Kies je energieniveau').max(5, 'Energieniveau moet tussen 1 en 5 zijn'),
  daily_intention: z.string().min(1, 'Dagelijkse intentie is vereist').max(500, 'Intentie mag maximaal 500 karakters bevatten'),
  
  // Sleep & Wellness
  sleep_hours: z.number().optional(), // Calculated automatically from bedtime and wake_up_time
  sleep_quality: z.number().min(1, 'Kies je slaapkwaliteit').max(5, 'Slaapkwaliteit moet tussen 1 en 5 zijn'),
  wake_up_time: z.string().min(1, 'Wakker worden tijd is vereist'),
  bedtime: z.string().min(1, 'Bedtijd is vereist'),
  
  // Activities
  exercise_minutes: z.number().min(0, 'Sportminuten kunnen niet negatief zijn').max(1440, 'Sportminuten kunnen niet meer dan 1440 zijn'),
  exercise_type: z.string().optional(),
  meditation_minutes: z.number().min(0, 'Meditatieminuten kunnen niet negatief zijn').max(1440, 'Meditatieminuten kunnen niet meer dan 1440 zijn'),
  meditation_type: z.string().optional(),
  outdoor_time: z.number().min(0, 'Buitentijd kan niet negatief zijn').max(1440, 'Buitentijd kan niet meer dan 1440 minuten zijn'),
  
  // Nutrition
  water_glasses: z.number().min(0, 'Aantal glazen water kan niet negatief zijn').max(20, 'Aantal glazen water lijkt te hoog'),
  
  // Reflection
  gratitude: z.string().max(1000, 'Dankbaarheid mag maximaal 1000 karakters bevatten').optional(),
  day_highlight: z.string().max(1000, 'Hoogtepunt mag maximaal 1000 karakters bevatten').optional(),
  challenges_faced: z.string().max(1000, 'Uitdagingen mogen maximaal 1000 karakters bevatten').optional(),
  tomorrow_focus: z.string().max(500, 'Morgenfocus mag maximaal 500 karakters bevatten').optional(),
  
  // Wellness tracking
  stress_level: z.number().min(1, 'Kies je stressniveau').max(5, 'Stressniveau moet tussen 1 en 5 zijn'),
  
  // Optional fields
  notes: z.string().max(2000, 'Notities mogen maximaal 2000 karakters bevatten').optional(),
})

export type DailyEntryFormData = z.infer<typeof dailyEntrySchema>

// Step-by-step schemas for multi-step form
export const basicInfoStepSchema = dailyEntrySchema.pick({
  mood: true,
  energy_level: true,
  daily_intention: true,
})

export const sleepWellnessStepSchema = dailyEntrySchema.pick({
  sleep_hours: true,
  sleep_quality: true,
  wake_up_time: true,
  bedtime: true,
  stress_level: true,
})

export const activitiesStepSchema = dailyEntrySchema.pick({
  exercise_minutes: true,
  exercise_type: true,
  meditation_minutes: true,
  meditation_type: true,
  outdoor_time: true,
})

export const nutritionStepSchema = dailyEntrySchema.pick({
  water_glasses: true,
})

export const reflectionStepSchema = dailyEntrySchema.pick({
  gratitude: true,
  day_highlight: true,
  challenges_faced: true,
  tomorrow_focus: true,
  notes: true,
})

export type BasicInfoStepData = z.infer<typeof basicInfoStepSchema>
export type SleepWellnessStepData = z.infer<typeof sleepWellnessStepSchema>
export type ActivitiesStepData = z.infer<typeof activitiesStepSchema>
export type NutritionStepData = z.infer<typeof nutritionStepSchema>
export type ReflectionStepData = z.infer<typeof reflectionStepSchema>

// Default values for form initialization
export const defaultDailyEntryValues: Partial<DailyEntryFormData> = {
  mood: 3,
  energy_level: 3,
  daily_intention: '',
  sleep_hours: 0, // Will be calculated automatically
  sleep_quality: 3,
  wake_up_time: '07:00',
  bedtime: '22:30',
  exercise_minutes: 0,
  exercise_type: '',
  meditation_minutes: 0,
  meditation_type: '',
  outdoor_time: 0,
  water_glasses: 8,
  gratitude: '',
  day_highlight: '',
  challenges_faced: '',
  tomorrow_focus: '',
  stress_level: 3,
  notes: '',
}