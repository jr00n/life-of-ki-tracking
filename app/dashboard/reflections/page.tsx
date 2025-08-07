import { Metadata } from 'next'
import { WeeklyReflectionsOverview } from '@/components/dashboard/WeeklyReflectionsOverview'

export const metadata: Metadata = {
  title: 'Wekelijkse Reflecties | Life of Ki',
  description: 'Bekijk je eerdere wekelijkse reflecties en voortgang over tijd.',
}

export default function ReflectionsOverviewPage() {
  return <WeeklyReflectionsOverview />
}