import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/develop/(views)/official/settings/profile'

export const Route = createFileRoute('/_authenticated/official/settings/')({
     component: SettingsProfile,
})
