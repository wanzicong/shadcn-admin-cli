import { createFileRoute } from '@tanstack/react-router'
import { SettingsAppearance } from '@/develop/(views)/official/settings/appearance'

export const Route = createFileRoute('/_authenticated/official/settings/appearance')({
     component: SettingsAppearance,
})
