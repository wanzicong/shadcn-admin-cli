import { createFileRoute } from '@tanstack/react-router'
import { SettingsAccount } from '@/develop/(views)/official/settings/account'

export const Route = createFileRoute('/_authenticated/official/settings/account')({
     component: SettingsAccount,
})
