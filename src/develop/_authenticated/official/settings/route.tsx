import { createFileRoute } from '@tanstack/react-router'
import { Settings } from '@/develop/(views)/official/settings'

export const Route = createFileRoute('/_authenticated/official/settings')({
     component: Settings,
})
