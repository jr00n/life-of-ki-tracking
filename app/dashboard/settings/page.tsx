import { Metadata } from 'next'
import { SettingsPage } from '@/components/dashboard/SettingsPage'

export const metadata: Metadata = {
  title: 'Instellingen | Life of Ki',
  description: 'Beheer je persoonlijke instellingen en voorkeuren.',
}

export default function Settings() {
  return <SettingsPage />
}