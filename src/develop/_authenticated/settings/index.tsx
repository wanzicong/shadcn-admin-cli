import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/develop/(views)/settings/profile'

export const Route = createFileRoute('/_authenticated/settings/')({
     component: SettingsProfile,
})
