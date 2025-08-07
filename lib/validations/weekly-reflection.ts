import { z } from 'zod'

export const weeklyReflectionSchema = z.object({
  // Personal insight
  personal_insight: z.string()
    .min(1, 'Persoonlijk inzicht is vereist')
    .max(2000, 'Persoonlijk inzicht mag maximaal 2000 karakters bevatten'),
  
  // Movement goals
  movement_goal_achieved: z.boolean(),
  movement_goal_next_week: z.string()
    .min(1, 'Bewegingsdoel voor volgende week is vereist')
    .max(500, 'Bewegingsdoel mag maximaal 500 karakters bevatten'),
  
  // Nutrition goals
  nutrition_goal_achieved: z.boolean(),
  nutrition_goal_next_week: z.string()
    .min(1, 'Voedingsdoel voor volgende week is vereist')
    .max(500, 'Voedingsdoel mag maximaal 500 karakters bevatten'),
  
  // Relaxation
  favorite_relaxation: z.string()
    .min(1, 'Favoriete ontspanning is vereist')
    .max(500, 'Favoriete ontspanning mag maximaal 500 karakters bevatten'),
  relaxation_goal_next_week: z.string()
    .min(1, 'Ontspanningsdoel voor volgende week is vereist')
    .max(500, 'Ontspanningsdoel mag maximaal 500 karakters bevatten'),
  
  // Overall energy reflection
  overall_energy_reflection: z.string()
    .min(1, 'Algehele energie reflectie is vereist')
    .max(2000, 'Algehele energie reflectie mag maximaal 2000 karakters bevatten'),
})

export type WeeklyReflectionFormData = z.infer<typeof weeklyReflectionSchema>

// Default values for form initialization
export const defaultWeeklyReflectionValues: Partial<WeeklyReflectionFormData> = {
  personal_insight: '',
  movement_goal_achieved: undefined,
  movement_goal_next_week: '',
  nutrition_goal_achieved: undefined,
  nutrition_goal_next_week: '',
  favorite_relaxation: '',
  relaxation_goal_next_week: '',
  overall_energy_reflection: '',
}