'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Save, Settings as SettingsIcon, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useTheme } from '@/hooks/useTheme'
import Link from 'next/link'

export function SettingsPage() {
  const { toast } = useToast()
  const {
    isLoading,
    weekStartDay,
    updateWeekStartDay,
    getWeekStartDayLabel,
    getWeekDates,
    WEEK_DAYS,
    THEME_OPTIONS,
  } = useUserPreferences()
  
  const { theme, setTheme } = useTheme()
  
  const [selectedWeekStartDay, setSelectedWeekStartDay] = useState<number>(weekStartDay)
  const [selectedTheme, setSelectedTheme] = useState<string>(theme || 'system')
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state with props when they change
  useEffect(() => {
    setSelectedWeekStartDay(weekStartDay)
  }, [weekStartDay])

  useEffect(() => {
    setSelectedTheme(theme || 'system')
  }, [theme])

  const handleSave = async () => {
    setIsSaving(true)
    
    let hasSuccess = true
    let messages = []
    
    // Update week start day if changed
    if (selectedWeekStartDay !== weekStartDay) {
      const success = await updateWeekStartDay(selectedWeekStartDay)
      if (success) {
        messages.push(`Week begint nu op ${getWeekStartDayLabel(selectedWeekStartDay)}`)
      } else {
        hasSuccess = false
      }
    }
    
    // Update theme if changed
    if (selectedTheme !== theme) {
      await setTheme(selectedTheme)
      const themeLabel = THEME_OPTIONS.find(t => t.value === selectedTheme)?.label || selectedTheme
      messages.push(`Thema ingesteld op ${themeLabel}`)
    }
    
    if (hasSuccess && messages.length > 0) {
      toast({
        title: 'Instellingen opgeslagen',
        description: messages.join(' • '),
      })
    }
    
    setIsSaving(false)
  }

  const hasChanges = selectedWeekStartDay !== weekStartDay || selectedTheme !== theme

  // Show example of how the week would look with the selected start day
  const getExampleWeekRange = () => {
    const { weekStart, weekEnd } = getWeekDates(new Date(), selectedWeekStartDay)
    const startDate = new Date(weekStart)
    const endDate = new Date(weekEnd)
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  if (isLoading) {
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
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Instellingen
              </CardTitle>
              <CardDescription>
                Beheer je persoonlijke voorkeuren
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Start Day Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week Instellingen
          </CardTitle>
          <CardDescription>
            Configureer wanneer je week begint voor wekelijkse reflecties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="week-start-day">Eerste dag van de week</Label>
              <Select
                value={selectedWeekStartDay.toString()}
                onValueChange={(value) => setSelectedWeekStartDay(parseInt(value))}
              >
                <SelectTrigger id="week-start-day">
                  <SelectValue placeholder="Kies een dag" />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Dit bepaalt wanneer je wekelijkse reflectie periode begint en eindigt.
              </p>
            </div>

            {/* Example Week Preview */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">Voorbeeld van huidige week:</p>
              <p className="text-sm text-muted-foreground">
                Met {getWeekStartDayLabel(selectedWeekStartDay)} als eerste dag:
              </p>
              <p className="text-sm font-medium text-primary mt-1">
                {getExampleWeekRange()}
              </p>
            </div>

            {/* Info for coach meetings */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-4">
              <p className="text-sm">
                <strong>💡 Tip:</strong> Als je wekelijkse coach gesprekken hebt, 
                stel dan de dag voor je gesprek in als de laatste dag van je week. 
                Bijvoorbeeld: gesprek op vrijdag? Stel zaterdag in als eerste dag van de week.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Thema Instellingen
          </CardTitle>
          <CardDescription>
            Kies je voorkeur voor licht of donker thema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">Thema voorkeur</Label>
              <Select
                value={selectedTheme}
                onValueChange={setSelectedTheme}
              >
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Kies een thema" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map((themeOption) => (
                    <SelectItem key={themeOption.value} value={themeOption.value}>
                      <div className="flex items-center gap-2">
                        <span>{themeOption.icon}</span>
                        <span>{themeOption.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                "Systeem" volgt je apparaat instelling voor licht/donker modus.
              </p>
            </div>

            {/* Theme Preview */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">Huidige thema:</p>
              <div className="flex items-center gap-2">
                {THEME_OPTIONS.find(t => t.value === selectedTheme)?.icon}
                <span className="text-sm">
                  {THEME_OPTIONS.find(t => t.value === selectedTheme)?.label}
                </span>
                {selectedTheme === 'system' && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (volgt je apparaat)
                  </span>
                )}
              </div>
            </div>

            {/* Theme info */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-4">
              <p className="text-sm">
                <strong>💡 Tip:</strong> Het donkere thema kan helpen bij het verminderen van 
                oogvermoeidheid tijdens avonduren en kan batterij besparen op OLED schermen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button - Moved here to save all settings together */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Opslaan...' : 'Alle Instellingen Opslaan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future Settings Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-muted-foreground">
            Meer instellingen
          </CardTitle>
          <CardDescription>
            Binnenkort beschikbaar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hier komen in de toekomst meer personalisatie opties zoals:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Notificatie voorkeuren</li>
            <li>Thema instellingen (licht/donker)</li>
            <li>Taal voorkeuren</li>
            <li>Data export opties</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}