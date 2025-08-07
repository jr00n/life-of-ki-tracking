import { Metadata } from 'next'
import { WeeklyReflectionPage } from '@/components/dashboard/WeeklyReflectionPage'

export const metadata: Metadata = {
  title: 'Wekelijkse Reflectie | Life of Ki',
  description: 'Vul je wekelijkse reflectie in om je voortgang te volgen en doelen te stellen.',
}

export default function ReflectionPage() {
  return <WeeklyReflectionPage />
}