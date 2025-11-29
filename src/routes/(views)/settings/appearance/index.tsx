import { ContentSection } from '../components/content-section.tsx'
import { AppearanceForm } from './appearance-form.tsx'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Appearance'
      desc='Customize the appearance of the app. Automatically switch between day
          and night themes.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
