'use client'

import { useState } from 'react'
import { Trash2, Edit3, Check, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { NutritionEntryWithTime } from '@/hooks/useNutritionEntries'

interface NutritionEntryItemProps {
  entry: NutritionEntryWithTime
  onUpdate: (id: string, time: string, description: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddToFavorites?: (description: string, time: string) => Promise<void>
  isFavorite?: boolean
}

export function NutritionEntryItem({ entry, onUpdate, onDelete, onAddToFavorites, isFavorite }: NutritionEntryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTime, setEditTime] = useState(entry.time_consumed)
  const [editDescription, setEditDescription] = useState(entry.food_description)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!editTime.trim() || !editDescription.trim()) return
    
    try {
      setLoading(true)
      await onUpdate(entry.id, editTime, editDescription)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditTime(entry.time_consumed)
    setEditDescription(entry.food_description)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze voeding entry wilt verwijderen?')) return
    
    try {
      setLoading(true)
      await onDelete(entry.id)
    } catch (error) {
      console.error('Error deleting entry:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            className="w-24"
            disabled={loading}
          />
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-medium text-muted-foreground">Bewerken</span>
        </div>
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Wat heb je gegeten?"
          className="min-h-[60px] resize-none"
          disabled={loading}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading || !editTime.trim() || !editDescription.trim()}
            className="h-8"
          >
            <Check className="h-3 w-3 mr-1" />
            Opslaan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Annuleren
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 group hover:border-primary/20 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary">
              {entry.time_consumed}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {entry.food_description}
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          {onAddToFavorites && !isFavorite && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddToFavorites(entry.food_description, entry.time_consumed)}
              disabled={loading}
              className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"
              title="Toevoegen aan favorieten"
            >
              <Star className="h-3 w-3" />
            </Button>
          )}
          {isFavorite && (
            <div className="h-8 w-8 p-0 flex items-center justify-center text-yellow-600">
              <Star className="h-3 w-3 fill-current" />
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="h-8 w-8 p-0"
            title="Bewerken"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            title="Verwijderen"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}