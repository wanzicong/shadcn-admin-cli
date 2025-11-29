import { ContentSection } from '../components/content-section.tsx'
import { ProfileForm } from './profile-form.tsx'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Profile'
      desc='This is how others will see you on the site.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
