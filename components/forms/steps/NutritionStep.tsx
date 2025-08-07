'use client'

import { UseFormReturn } from 'react-hook-form'
import { Droplets, Star, MessageSquare, Lightbulb, Target, UtensilsCrossed } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNutritionEntries } from '@/hooks/useNutritionEntries'
import { useFavoriteFoods } from '@/hooks/useFavoriteFoods'
import { NutritionEntryItem } from '@/components/forms/NutritionEntryItem'
import { AddNutritionEntry } from '@/components/forms/AddNutritionEntry'
import { QuickAddFoods } from '@/components/forms/QuickAddFoods'
import type { DailyEntryFormData } from '@/lib/validations/daily-entry'

interface NutritionStepProps {
  form: UseFormReturn<DailyEntryFormData>
  dailyEntryId?: string | null
}

export function NutritionStep({ form, dailyEntryId }: NutritionStepProps) {
  const {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry
  } = useNutritionEntries(dailyEntryId || null)
  
  const { createFromEntry, favorites } = useFavoriteFoods()
  
  // Check if an entry is a favorite
  const isFavorite = (description: string) => {
    return favorites.some(fav => fav.description === description)
  }

  return (
    <div className="space-y-8">
      
      {/* Quick Add Section - Only show if we have a dailyEntryId */}
      {dailyEntryId && favorites.length > 0 && (
        <QuickAddFoods onQuickAdd={async (time, description) => {
          await addEntry(time, description)
        }} />
      )}
      
      {/* Nutrition Timeline Section */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-orange-600" />
            </div>
            Wat heb je gegeten vandaag?
          </CardTitle>
          <FormDescription>
            Voeg je maaltijden toe met tijdstip. Je kunt meerdere items per maaltijd noteren.
          </FormDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Existing entries */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Voeding entries laden...
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Jouw maaltijden vandaag
              </h4>
              {entries.map((entry) => (
                <NutritionEntryItem
                  key={entry.id}
                  entry={entry}
                  onUpdate={async (id, time, description) => {
                    await updateEntry(id, time, description)
                  }}
                  onDelete={deleteEntry}
                  onAddToFavorites={async (description, time) => {
                    await createFromEntry(description, time)
                  }}
                  isFavorite={isFavorite(entry.food_description)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nog geen maaltijden toegevoegd voor vandaag</p>
            </div>
          )}
          
          {/* Add new entry */}
          <AddNutritionEntry onAdd={async (time, description) => {
            await addEntry(time, description)
          }} />
          
          <div className="pt-4 text-xs text-muted-foreground">
            💡 <strong>Tips:</strong> Je kunt per maaltijd meerdere items toevoegen door ze op nieuwe regels te zetten. 
            Bijvoorbeeld: &quot;Boterham kaas, Cappuccino haver, 1 banaan&quot; (elk op een nieuwe regel)
          </div>
        </CardContent>
      </Card>

      {/* Water Intake Section */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <FormField
            control={form.control}
            name="water_glasses"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  Glazen water vandaag
                </FormLabel>
                <FormDescription>
                  Hoeveel glazen water heb je gedronken? (1 glas ≈ 250ml)
                </FormDescription>
                <div className="space-y-4">
                  <FormControl>
                    <Slider
                      min={0}
                      max={15}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {field.value}
                    </span>
                    <span className="text-lg text-muted-foreground ml-2">
                      glas{field.value !== 1 ? 'en' : ''}
                    </span>
                    <span className="text-sm text-muted-foreground block mt-1">
                      ≈ {(field.value * 0.25).toFixed(1)} liter
                    </span>
                    <div className="mt-2">
                      {field.value >= 8 && (
                        <p className="text-sm text-green-600">
                          Prima! Je hebt voldoende gedronken
                        </p>
                      )}
                      {field.value >= 6 && field.value < 8 && (
                        <p className="text-sm text-blue-600">
                          Bijna het dagelijkse doel bereikt
                        </p>
                      )}
                      {field.value < 6 && (
                        <p className="text-sm text-amber-600">
                          Probeer meer water te drinken
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

      {/* Reflection Sections */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-center">Dagelijkse Reflectie</h3>
        
        {/* Gratitude */}
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="gratitude"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    Waar ben je dankbaar voor? (optioneel)
                  </FormLabel>
                  <FormDescription>
                    Schrijf op waar je vandaag dankbaar voor bent, groot of klein
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ik ben dankbaar voor..."
                      className="min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground">
                    {field.value?.length || 0} / 1000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Day Highlight */}
        <Card className="border-pink-200 dark:border-pink-800">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="day_highlight"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                      <Lightbulb className="h-5 w-5 text-pink-600" />
                    </div>
                    Hoogtepunt van de dag (optioneel)
                  </FormLabel>
                  <FormDescription>
                    Wat was het mooiste moment van vandaag?
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Het hoogtepunt van mijn dag was..."
                      className="min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground">
                    {field.value?.length || 0} / 1000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Tomorrow Focus */}
        <Card className="border-indigo-200 dark:border-indigo-800">
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="tomorrow_focus"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <Target className="h-5 w-5 text-indigo-600" />
                    </div>
                    Focus voor morgen (optioneel)
                  </FormLabel>
                  <FormDescription>
                    Waar wil je je morgen op concentreren?
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Morgen wil ik..."
                      className="min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground">
                    {field.value?.length || 0} / 500
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                    </div>
                    Aanvullende notities (optioneel)
                  </FormLabel>
                  <FormDescription>
                    Alle andere gedachten, observaties of ervaringen van vandaag
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Verder nog iets dat ik wil onthouden..."
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground">
                    {field.value?.length || 0} / 2000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}