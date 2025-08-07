'use client'

import { useState } from 'react'
import { Plus, BookOpen, Target, Heart, Clock, UtensilsCrossed, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  const quickActions = [
    {
      icon: UtensilsCrossed,
      label: 'Maaltijden Toevoegen',
      description: 'Snel je eten voor vandaag invoeren',
      href: '/dashboard/quick-meal',
      color: 'bg-orange-500 text-white',
      priority: true
    },
    {
      icon: MessageSquare,
      label: 'Wekelijkse Reflectie',
      description: 'Reflecteer op je week en stel doelen',
      href: '/dashboard/reflection',
      color: 'bg-purple-500 text-white',
      priority: true
    },
    {
      icon: BookOpen,
      label: 'Dagelijkse Entry',
      description: 'Log je stemming, activiteiten en inzichten',
      href: '/dashboard/entry',
      color: 'bg-primary text-primary-foreground'
    },
    {
      icon: Target,
      label: 'Intentie Instellen',
      description: 'Stel je focus voor vandaag',
      href: '/dashboard/entry?step=intention',
      color: 'bg-blue-500 text-white'
    },
    {
      icon: Heart,
      label: 'Stemming Check',
      description: 'Hoe voel je je nu?',
      href: '/dashboard/entry?step=mood',
      color: 'bg-pink-500 text-white'
    },
    {
      icon: Clock,
      label: 'Snelle Update',
      description: 'Bijwerken van activiteiten',
      href: '/dashboard/entry?step=activities',
      color: 'bg-green-500 text-white'
    }
  ]

  return (
    <>
      {/* Desktop floating action button */}
      <div className="hidden lg:block">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Snelle Acties</DialogTitle>
              <DialogDescription>
                Kies wat je wilt doen
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile quick actions card */}
      <div className="lg:hidden">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold text-sm mb-3">Snelle Acties</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.slice(0, 4).map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}