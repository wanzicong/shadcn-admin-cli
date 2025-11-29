import { createFileRoute } from '@tanstack/react-router'
import { SettingsDisplay } from '@/develop/(views)/official/settings/display'

export const Route = createFileRoute('/_authenticated/official/settings/display')({
     component: SettingsDisplay,
})
