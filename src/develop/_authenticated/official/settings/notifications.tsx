import { createFileRoute } from '@tanstack/react-router'
import { SettingsNotifications } from '@/develop/(views)/official/settings/notifications'

export const Route = createFileRoute('/_authenticated/official/settings/notifications')({
     component: SettingsNotifications,
})
