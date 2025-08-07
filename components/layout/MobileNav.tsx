'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, Calendar, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Reflectie',
    href: '/dashboard/reflections',
    icon: MessageSquare,
  },
  {
    name: 'Toevoegen',
    href: '/dashboard/entry',
    icon: Plus,
  },
  {
    name: 'Kalender',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    name: 'Analyse',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid h-16 grid-cols-5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors hover:text-primary",
                isActive 
                  ? "text-primary bg-primary/5" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive && "text-primary"
              )} />
              <span className={cn(
                "text-xs",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}