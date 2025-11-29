import { ContentSection } from '../components/content-section.tsx'
import { DisplayForm } from './display-form.tsx'

export function SettingsDisplay() {
  return (
    <ContentSection
      title='Display'
      desc="Turn items on or off to control what's displayed in the app."
    >
      <DisplayForm />
    </ContentSection>
  )
}
