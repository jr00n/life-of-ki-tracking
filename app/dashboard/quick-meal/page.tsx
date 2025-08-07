'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UtensilsCrossed, Save, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useDailyEntry } from '@/hooks/useDailyEntry'
import { useNutritionEntries } from '@/hooks/useNutritionEntries'
import { useFavoriteFoods } from '@/hooks/useFavoriteFoods'
import { defaultDailyEntryValues } from '@/lib/validations/daily-entry'
import { NutritionEntryItem } from '@/components/forms/NutritionEntryItem'
import { AddNutritionEntry } from '@/components/forms/AddNutritionEntry'
import { QuickAddFoods } from '@/components/forms/QuickAddFoods'

export default function QuickMealPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [dailyEntryId, setDailyEntryId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const { toast } = useToast()
  const { user } = useAuth()
  const dailyEntryHook = useDailyEntry()
  const { getEntryForDate, saveEntry } = dailyEntryHook
  
  // Debug the hook return (can be removed later)
  // console.log('useDailyEntry hook result:', Object.keys(dailyEntryHook))
  const router = useRouter()
  
  const {
    entries,
    loading: entriesLoading,
    error,
    addEntry,
    updateEntry,
    deleteEntry
  } = useNutritionEntries(dailyEntryId)
  
  const { createFromEntry, favorites } = useFavoriteFoods()
  
  // Check if an entry is a favorite
  const isFavorite = (description: string) => {
    return favorites.some(fav => fav.description === description)
  }
  
  // Get today's date
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00')
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('nl-NL', options)
  }
  
  // Load or create today's entry
  useEffect(() => {
    async function loadOrCreateEntry() {
      if (!user || !user.id) {
        console.log('loadOrCreateEntry: No user available, skipping')
        setIsLoading(false)
        return
      }
      
      if (dailyEntryId) {
        console.log('loadOrCreateEntry: Already have dailyEntryId, skipping')
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      const today = getTodayDate()
      setSelectedDate(today)
      
      try {
        // Check if entry exists for today
        console.log('Checking for existing entry for date:', today)
        const existingEntry = await getEntryForDate(today)
        console.log('Existing entry result:', existingEntry)
        
        if (existingEntry) {
          console.log('Found existing entry, using its ID:', existingEntry.id)
          setDailyEntryId(existingEntry.id)
        } else {
          console.log('No existing entry found, will continue without daily entry ID')
          // Don't try to create entry automatically - user can add nutrition entries manually
          // or create entry through the main entry form
          setDailyEntryId(null)
          // Don't show the toast message if there are already nutrition entries for today
          // This indicates there might be a daily entry but our query isn't finding it
        }
      } catch (error) {
        console.error('Error loading/creating entry:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          user: user?.id,
          today
        })
        toast({
          title: 'Fout',
          description: `Kon dagelijkse entry niet laden of aanmaken: ${error.message}`,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadOrCreateEntry()
  }, [user, dailyEntryId])
  
  if (isLoading || !user) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              {!user ? 'Gebruiker laden...' : 'Entry laden...'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar dashboard
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(selectedDate)}
        </div>
      </div>
      
      {/* Page Title */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-orange-600" />
            </div>
            Snel Maaltijden Toevoegen
          </CardTitle>
          <CardDescription>
            Voeg snel je maaltijden toe voor vandaag. Je andere dagelijkse gegevens kun je later aanvullen.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Quick Add Section */}
      {dailyEntryId && favorites.length > 0 && (
        <QuickAddFoods onQuickAdd={addEntry} />
      )}
      
      {/* Info message if no dailyEntryId and no entries exist */}
      {!dailyEntryId && entries.length === 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ℹ️ Beperkte modus: Maaltijden kunnen toegevoegd worden, maar sommige features (favorieten, quick add) zijn niet beschikbaar.
              Probeer de volledige <strong>Dagelijkse Entry</strong> voor alle functionaliteit.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Nutrition Timeline Section */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-orange-600" />
            </div>
            Vandaag&apos;s Maaltijden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Existing entries */}
          {entriesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Voeding entries laden...
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {entries.length} maaltijd{entries.length !== 1 ? 'en' : ''} toegevoegd
              </h4>
              {entries.map((entry) => (
                <NutritionEntryItem
                  key={entry.id}
                  entry={entry}
                  onUpdate={updateEntry}
                  onDelete={deleteEntry}
                  onAddToFavorites={createFromEntry}
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
          <AddNutritionEntry onAdd={addEntry} />
        </CardContent>
      </Card>
      
      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Klaar - Terug naar Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/entry?date=${selectedDate}`)}
              className="flex-1"
            >
              Volledige entry invullen
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground text-center mt-4">
            Je maaltijden zijn automatisch opgeslagen. Je kunt later terugkomen om meer details toe te voegen.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}