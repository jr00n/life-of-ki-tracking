'use client'

import { useState } from 'react'
import { Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

interface AddNutritionEntryProps {
  onAdd: (time: string, description: string) => Promise<void>
}

export function AddNutritionEntry({ onAdd }: AddNutritionEntryProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!time.trim() || !description.trim()) return
    
    try {
      setLoading(true)
      await onAdd(time, description)
      
      // Reset form
      setTime('')
      setDescription('')
      setIsAdding(false)
    } catch (error) {
      console.error('Error adding entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setTime('')
    setDescription('')
    setIsAdding(false)
  }

  // Get current time as default
  const getCurrentTime = () => {
    const now = new Date()
    return now.toTimeString().slice(0, 5) // HH:MM format
  }

  if (isAdding) {
    return (
      <Card className="border-dashed border-primary/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Nieuwe maaltijd toevoegen</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Tijdstip
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder={getCurrentTime()}
                className="w-32"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Wat heb je gegeten?
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bijv: Boterham jam, Boterham kaas, 1x Cappuccino haver 60ml 38 cal"
                className="min-h-[80px] resize-none"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Je kunt meerdere items op nieuwe regels zetten
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAdd}
              disabled={loading || !time.trim() || !description.trim()}
              size="sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Toevoegen
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              size="sm"
            >
              Annuleren
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed border-gray-300 dark:border-gray-700 hover:border-primary/50 transition-colors cursor-pointer">
      <CardContent 
        className="pt-6 pb-4 text-center"
        onClick={() => {
          setTime(getCurrentTime()) // Set current time as default
          setIsAdding(true)
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Maaltijd toevoegen
          </span>
          <span className="text-xs text-muted-foreground">
            Klik om een nieuwe voeding entry toe te voegen
          </span>
        </div>
      </CardContent>
    </Card>
  )
}