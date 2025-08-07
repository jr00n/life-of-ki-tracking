'use client'

import { useState } from 'react'
import { Star, Clock, Coffee, Sandwich, Apple, Droplet, Plus, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useFavoriteFoods } from '@/hooks/useFavoriteFoods'
import type { FavoriteFood } from '@/types/database.types'

interface QuickAddFoodsProps {
  onQuickAdd: (time: string, description: string) => Promise<void>
}

const CATEGORY_ICONS = {
  ontbijt: Coffee,
  lunch: Sandwich,
  diner: Sandwich,
  snack: Apple,
  drank: Droplet,
  anders: Star
}

const CATEGORY_COLORS = {
  ontbijt: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  lunch: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  diner: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  snack: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  drank: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
  anders: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

export function QuickAddFoods({ onQuickAdd }: QuickAddFoodsProps) {
  const { favorites, loading, recordUsage } = useFavoriteFoods()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Get current time as default
  const getCurrentTime = () => {
    const now = new Date()
    return now.toTimeString().slice(0, 5)
  }

  const handleQuickAdd = async (favorite: FavoriteFood) => {
    const time = selectedTime || favorite.default_time || getCurrentTime()
    
    try {
      await onQuickAdd(time, favorite.description)
      await recordUsage(favorite.id)
      
      // Reset time after successful add
      setSelectedTime('')
    } catch (error) {
      console.error('Error quick adding food:', error)
    }
  }

  // Group favorites by category
  const groupedFavorites = favorites.reduce((acc, fav) => {
    const category = fav.category || 'anders'
    if (!acc[category]) acc[category] = []
    acc[category].push(fav)
    return acc
  }, {} as Record<string, FavoriteFood[]>)

  // Get top 6 most used favorites for compact view
  const topFavorites = favorites.slice(0, 6)

  if (loading) {
    return (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Favorieten laden...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (favorites.length === 0) {
    return null // Don't show quick add if no favorites
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <span>Snel toevoegen</span>
          </div>
          {favorites.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? (
                <>
                  <X className="h-3 w-3 mr-1" />
                  Minder
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Alle ({favorites.length})
                </>
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time selector */}
        <div className="flex items-center gap-2 pb-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Tijd:</span>
          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-24 h-8 text-sm"
            placeholder={getCurrentTime()}
          />
          <span className="text-xs text-muted-foreground">
            (of gebruik standaard tijd)
          </span>
        </div>

        {/* Compact view - Top favorites */}
        {!isExpanded ? (
          <div className="grid grid-cols-2 gap-2">
            {topFavorites.map((favorite) => {
              const Icon = CATEGORY_ICONS[favorite.category || 'anders']
              return (
                <Button
                  key={favorite.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(favorite)}
                  className="h-auto p-3 justify-start text-left hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <div className="flex items-start gap-2 w-full">
                    <Icon className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {favorite.name}
                      </div>
                      {favorite.default_time && (
                        <div className="text-xs text-muted-foreground">
                          {favorite.default_time}
                        </div>
                      )}
                    </div>
                    {favorite.usage_count > 5 && (
                      <Badge variant="secondary" className="ml-1 text-xs px-1 py-0">
                        {favorite.usage_count}×
                      </Badge>
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        ) : (
          /* Expanded view - All favorites grouped by category */
          <div className="space-y-4">
            {Object.entries(groupedFavorites).map(([category, items]) => {
              const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
              const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {items.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((favorite) => (
                      <Button
                        key={favorite.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(favorite)}
                        className={`h-auto p-3 justify-start text-left hover:${colorClass}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {favorite.name}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {favorite.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {favorite.default_time && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                <Clock className="h-3 w-3 mr-1" />
                                {favorite.default_time}
                              </Badge>
                            )}
                            {favorite.usage_count > 0 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                {favorite.usage_count}× gebruikt
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info text */}
        <div className="pt-2 text-xs text-muted-foreground border-t">
          💡 <strong>Tip:</strong> Favorieten worden automatisch aangemaakt als je een item vaker gebruikt
        </div>
      </CardContent>
    </Card>
  )
}