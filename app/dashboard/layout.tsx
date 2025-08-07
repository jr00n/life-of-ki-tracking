import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
        {children}
      </main>
      
      <MobileNav />
      <Toaster />
    </div>
  )
}

export const metadata = {
  title: 'Dashboard | KAMP KI',
  description: 'Volg je KAMP KI reis met gepersonaliseerde inzichten.',
}