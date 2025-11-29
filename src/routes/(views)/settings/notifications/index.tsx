import { ContentSection } from '../components/content-section.tsx'
import { NotificationsForm } from './notifications-form.tsx'

export function SettingsNotifications() {
  return (
    <ContentSection
      title='Notifications'
      desc='Configure how you receive notifications.'
    >
      <NotificationsForm />
    </ContentSection>
  )
}
